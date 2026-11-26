import { get, writable } from "svelte/store";

// Every song you've heard is kept on this device, forever, so it still plays with no signal
// (a plane, a tunnel, a dead zone mid-song).
//
// The page does this itself. There's no service worker: nothing sits between the player and the
// network, and the <audio> element always streams straight from the server. The saved copy is only
// played when the stream can't be reached (see recover() in Music.svelte).
//
// Same cache name the old in-page cache used, so songs saved before carry over
const TREASURE = "captainbrando-treasure";
// Let the song's own stream get a head start before downloading the copy to keep
const HEAD_START_MS = 15000;

/** Full URLs of every song saved on this device */
export const saved = writable<Set<string>>(new Set());

/** Songs waiting their turn to be saved */
export const pending = writable<Set<string>>(new Set());

/** The URL a song is saved under (dev srcs are relative) */
export const songKey = (src: string): string => new URL(src, location.href).href;

const canSave = typeof window !== "undefined" && "caches" in window;

/** Read which songs are already saved. Call once on start */
export async function loadSaved(): Promise<void> {
	if (!canSave) return;
	try {
		const keys = await (await caches.open(TREASURE)).keys();
		saved.update((s) => new Set([...s, ...keys.map((r) => r.url)]));
	} catch {
		// storage blocked (private mode): songs still stream
	}
}

const queue: string[] = [];
let busy = false;

function enqueue(url: string): void {
	if (get(saved).has(url) || queue.includes(url)) return;
	queue.push(url);
	pending.update((s) => new Set(s).add(url));
}

function dequeue(): string {
	const url = queue.shift();
	pending.update((s) => {
		const next = new Set(s);
		next.delete(url);
		return next;
	});
	return url;
}

let waitingForScreen = false;

/** You heard it, so it's yours: save the whole song for good (one at a time, screen on only) */
export function keepForever(src: string): void {
	if (!canSave) return;
	const url = songKey(src);
	if (get(saved).has(url) || queue.includes(url)) return;
	// Data saver on: don't spend their data on copies nobody asked for (the album button still works)
	if ((navigator as any).connection?.saveData) return;
	askToKeep();
	setTimeout(() => {
		enqueue(url);
		pump();
	}, HEAD_START_MS);
}

/** The album's save button: every song on it, in order, starting now */
export function keepAll(srcs: string[]): void {
	if (!canSave) return;
	askToKeep();
	for (const src of srcs) enqueue(songKey(src));
	pump();
}

/**
 * Download the next song in line. Only while the screen is on: with it off the phone throttles the
 * network, and the playing song's stream must never have to share it
 */
async function pump(): Promise<void> {
	if (busy || !queue.length) return;
	if (document.hidden) {
		if (!waitingForScreen) {
			waitingForScreen = true;
			document.addEventListener(
				"visibilitychange",
				() => {
					waitingForScreen = false;
					pump();
				},
				{ once: true }
			);
		}
		return;
	}
	busy = true;
	const url = dequeue();
	try {
		const res = await fetch(url, { mode: "cors", credentials: "omit" });
		// put() only commits once every byte has arrived, so a cut-off download keeps nothing
		if (res.status === 200) {
			await (await caches.open(TREASURE)).put(url, res);
			saved.update((s) => new Set(s).add(url));
		}
	} catch {
		// offline / cut off / out of space: it gets another go the next time it plays
	} finally {
		busy = false;
		pump();
	}
}

let asked = false;
/**
 * Ask the browser to never clear saved songs when the phone runs low on space. Firefox turns this
 * into a permission popup, so skip it there (it still keeps the songs, just without the promise)
 */
function askToKeep(): void {
	if (asked || /Firefox\//.test(navigator.userAgent)) return;
	asked = true;
	navigator.storage?.persisted?.().then((yes) => yes || navigator.storage.persist()).catch(() => {});
}

let lastCopy: string | null = null;

/**
 * A playable URL for the saved copy of a song (a blob: URL, so seeking works), or null if it isn't
 * saved. Only one is held at a time
 */
export async function savedCopy(src: string): Promise<string | null> {
	if (!canSave) return null;
	try {
		const res = await caches.match(songKey(src), { cacheName: TREASURE });
		if (!res) return null;
		const blob = await res.blob();
		if (lastCopy) URL.revokeObjectURL(lastCopy);
		lastCopy = URL.createObjectURL(blob);
		return lastCopy;
	} catch {
		return null;
	}
}
