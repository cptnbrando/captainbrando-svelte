import { writable } from "svelte/store";

/**
 * Songs saved on this device for offline listening (Cache Storage, served by
 * public/sw.js). Nothing here ever expires: once a song is saved it stays
 * until the browser's site data is cleared.
 */

// Same name the player has always cached into, so older saves still count
export const SONGS_CACHE = "captainbrando-treasure";

/** Absolute URLs of every saved song — drives the red dots */
export const saved = writable<Set<string>>(new Set());

const hasCache = typeof caches !== "undefined";
/** The key a song is saved under (its absolute URL) — check it against `saved` */
export const songKey = (src: string) => new URL(src, location.href).href;
const abs = songKey;
const mark = (src: string) =>
	saved.update((s) => {
		s.add(abs(src));
		return s;
	});

/**
 * Start the service worker, ask the browser never to evict saved songs, and
 * load the list of what's already saved
 */
export async function setupOffline(): Promise<void> {
	if (!hasCache) return;
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.register("/sw.js").catch(() => {});
		// the worker saved a song while it streamed
		navigator.serviceWorker.addEventListener("message", (e) => {
			if (e.data?.type === "cached") mark(e.data.url);
		});
	}
	// Without this the browser may clear saved songs when the phone runs low on space
	navigator.storage?.persist?.().catch(() => {});
	const cache = await caches.open(SONGS_CACHE);
	const keys = await cache.keys();
	saved.set(new Set(keys.map((k) => k.url)));
}

export async function isSaved(src: string): Promise<boolean> {
	if (!hasCache) return false;
	const cache = await caches.open(SONGS_CACHE);
	return !!(await cache.match(abs(src)));
}

/** Download one song into the cache (no-op if it's already there) */
export async function saveSong(src: string): Promise<boolean> {
	if (!hasCache) return false;
	if (await isSaved(src)) {
		mark(src);
		return true;
	}
	try {
		const res = await fetch(src);
		if (res.status !== 200) return false;
		const cache = await caches.open(SONGS_CACHE);
		await cache.put(abs(src), res);
		mark(src);
		return true;
	} catch (e) {
		return false;
	}
}

/**
 * Save a whole album, one song at a time
 * @returns how many of the songs are saved when it's done
 */
export async function saveAlbum(srcs: string[], onProgress: (done: number) => void): Promise<number> {
	let done = 0;
	for (const src of srcs) {
		if (await saveSong(src)) done++;
		onProgress(done);
	}
	return done;
}

let pending: string[] = [];

/**
 * A song just played. The service worker usually saved it while it streamed;
 * if it couldn't (iPhone, a seek, a dropped connection) download it now. With
 * the screen off that would fight the next song for a throttled connection,
 * so it waits until the screen is back on.
 */
export function saveAfterPlay(src: string): void {
	if (!hasCache) return;
	if (document.visibilityState === "visible") {
		saveSong(src);
		return;
	}
	if (!pending.includes(src)) pending.push(src);
}

if (typeof document !== "undefined") {
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState !== "visible" || pending.length === 0) return;
		const queue = pending;
		pending = [];
		queue.reduce((chain, src) => chain.then(() => saveSong(src)), Promise.resolve(true));
	});
}
