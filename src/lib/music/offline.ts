import { get, writable } from "svelte/store";

// The service worker (public/sw.js) keeps every song you've heard here, forever
const TREASURE = "captainbrando-treasure";

/** Full URLs of every song saved for offline */
export const saved = writable<Set<string>>(new Set());

/** The URL a song is saved under (dev srcs are relative) */
export const songKey = (src: string): string => new URL(src, location.href).href;

// Live site only. On the dev server it would serve stale files (and linger on localhost for
// other projects); set localStorage "cb-sw" = "1" to try it in dev anyway
const enabled = (() => {
	try {
		return import.meta.env.PROD || localStorage.getItem("cb-sw") === "1";
	} catch {
		return import.meta.env.PROD;
	}
})();

const canSave =
	enabled && typeof navigator !== "undefined" && "serviceWorker" in navigator && "caches" in window;

/**
 * Start the service worker, load the list of saved songs, and hand it everything
 * this first visit already loaded so the site opens with no network next time
 */
export async function setupOffline(warmUrls: string[] = []): Promise<void> {
	if (!canSave) return;
	navigator.serviceWorker.addEventListener("message", (e) => {
		if (e.data?.type === "saved") saved.update((s) => new Set(s).add(e.data.url));
	});
	navigator.serviceWorker.startMessages();

	try {
		const keys = await (await caches.open(TREASURE)).keys();
		saved.update((s) => new Set([...s, ...keys.map((r) => r.url)]));
	} catch {
		// storage blocked (private mode)
	}

	try {
		await navigator.serviceWorker.register("/sw.js");
		const reg = await navigator.serviceWorker.ready;
		const loaded = performance.getEntriesByType("resource").map((r) => r.name);
		reg.active?.postMessage({ type: "warm", urls: [...loaded, ...warmUrls] });
	} catch {
		// no service worker, the site still works online
	}
}

/**
 * A song is starting from the top (picked, next/prev, auto-advance). The service worker only
 * swaps in a new version of a saved song at a real start like this, never when a playing song
 * re-asks for its beginning (say, dragged back to 0:00)
 */
export function tellPlayStart(src: string): void {
	if (!canSave) return;
	navigator.serviceWorker.controller?.postMessage({ type: "start", url: songKey(src) });
}

/** You heard it, so it's yours: save the whole song for good */
export async function keepForever(src: string): Promise<void> {
	if (!canSave) return;
	const url = songKey(src);
	if (get(saved).has(url)) return;
	// Ask the browser to never evict us under storage pressure. Firefox turns this into a
	// permission popup, so skip it there (it still keeps the songs, just without the promise)
	if (!/Firefox\//.test(navigator.userAgent)) {
		navigator.storage?.persisted?.().then((yes) => yes || navigator.storage.persist()).catch(() => {});
	}
	const reg = await navigator.serviceWorker.ready;
	reg.active?.postMessage({ type: "keep", url });
}
