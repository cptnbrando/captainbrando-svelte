// Captain Brando's treasure chest: keeps the site and every song you've heard, forever.
//
// - Songs: saved whole the first time you hear one (the page asks via a "keep" message),
//   then always played from here, seeking included (Range requests answered from the copy).
//   Never expires. If the .mp3 on R2 is swapped out, a tiny HEAD check (at most every
//   CHECK_EVERY per song, only while online) spots the new Last-Modified / size and quietly
//   downloads the new version. The old copy is only replaced once the new one is fully saved
// - Site: index.html is network-first (new deploys land) with the saved copy as the fallback;
//   hashed /assets/* and album art are saved on first sight and never refetched

// Same name the old in-page cache used, so songs saved before this worker carry over
const TREASURE = "captainbrando-treasure";
const SHELL = "captainbrando-shell";
const SHELL_KEY = "/index.html";
const NAV_TIMEOUT_MS = 3000;
const CHECK_EVERY = 6 * 60 * 60 * 1000;
const ART_HOST = "raw.githubusercontent.com";
// Vite dev server internals, never cache these
const DEV_PATHS = /^\/(src|@|node_modules)\b/;

const isAudio = (url) => url.pathname.startsWith("/music/") && /\.mp3$/i.test(url.pathname);

self.addEventListener("install", (e) => {
	e.waitUntil(precacheShell().catch(() => {}));
	self.skipWaiting();
});

self.addEventListener("activate", (e) => {
	e.waitUntil(self.clients.claim());
});

self.addEventListener("message", (e) => {
	const msg = e.data || {};
	if (msg.type === "keep" && typeof msg.url === "string") {
		const url = new URL(msg.url, self.location.href);
		if (isAudio(url)) e.waitUntil(saveSong(url.href));
	} else if (msg.type === "warm" && Array.isArray(msg.urls)) {
		e.waitUntil(warm(msg.urls));
	}
});

self.addEventListener("fetch", (e) => {
	const req = e.request;
	if (req.method !== "GET") return;
	const url = new URL(req.url);

	if (isAudio(url)) return e.respondWith(song(e, req));
	if (req.mode === "navigate" && url.origin === self.location.origin) return e.respondWith(page(e, req));
	if (url.hostname === ART_HOST) return e.respondWith(keepFirst(req.url, true));
	if (url.origin === self.location.origin && !DEV_PATHS.test(url.pathname) && !req.headers.has("range")) {
		// Hashed build files never change; everything else in /public refreshes in the background
		if (url.pathname.startsWith("/assets/")) return e.respondWith(keepFirst(req.url, false));
		return e.respondWith(refreshInBackground(e, req));
	}
});

// ---- Songs ----

async function song(e, req) {
	const hit = await caches.match(req.url, { cacheName: TREASURE });
	if (!hit) return fetch(req);
	e.waitUntil(checkForNewVersion(req.url, hit));
	return slice(hit, req.headers.get("range"));
}

const saving = new Map();

/** Download the whole file and keep it. A broken download never replaces a good copy */
function saveSong(url, revalidate = false) {
	if (!saving.has(url)) {
		saving.set(
			url,
			(async () => {
				try {
					if (!revalidate && (await caches.match(url, { cacheName: TREASURE }))) return tell(url);
					const res = await fetch(url, {
						mode: "cors",
						credentials: "omit",
						cache: revalidate ? "no-cache" : "default",
					});
					if (res.status !== 200) return;
					// put() only commits once the whole body has arrived
					await (await caches.open(TREASURE)).put(url, res);
					tell(url);
				} catch {
					// offline / cut off mid-download: try again next listen
				} finally {
					saving.delete(url);
				}
			})()
		);
	}
	return saving.get(url);
}

const lastChecked = new Map();

/** Swapped the .mp3 on R2? Compare the server's Last-Modified / size with our copy */
async function checkForNewVersion(url, hit) {
	if (!self.navigator.onLine) return;
	if (Date.now() - (lastChecked.get(url) || 0) < CHECK_EVERY) return;
	lastChecked.set(url, Date.now());
	try {
		const head = await fetch(url, { method: "HEAD", mode: "cors", credentials: "omit", cache: "no-cache" });
		if (!head.ok) return;
		const changed = ["last-modified", "content-length"].some((h) => {
			const theirs = head.headers.get(h);
			const ours = hit.headers.get(h);
			return theirs && ours && theirs !== ours;
		});
		if (changed) await saveSong(url, true);
	} catch {
		// no network, keep what we have
	}
}

/** Answer a media Range request from the saved file */
async function slice(res, range) {
	const blob = await res.blob();
	const size = blob.size;
	const type = res.headers.get("content-type") || "audio/mpeg";
	const headers = { "Content-Type": type, "Accept-Ranges": "bytes" };
	const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
	if (!m || (!m[1] && !m[2])) {
		return new Response(blob, { status: 200, headers: { ...headers, "Content-Length": String(size) } });
	}
	let start, end;
	if (!m[1]) {
		// suffix range: the last N bytes
		start = Math.max(0, size - Number(m[2]));
		end = size - 1;
	} else {
		start = Number(m[1]);
		end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
	}
	if (start >= size || start > end) {
		return new Response(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${size}` } });
	}
	return new Response(blob.slice(start, end + 1), {
		status: 206,
		headers: {
			...headers,
			"Content-Length": String(end - start + 1),
			"Content-Range": `bytes ${start}-${end}/${size}`,
		},
	});
}

async function tell(url) {
	const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
	for (const c of clients) c.postMessage({ type: "saved", url });
}

// ---- Site ----

/** Network-first so deploys land, saved copy if the network is gone or slow */
async function page(e, req) {
	const shell = await caches.open(SHELL);
	const net = fetch(req);
	// Registered first, so it clones before the browser starts reading the body
	e.waitUntil(net.then((res) => res.ok && shell.put(SHELL_KEY, res.clone())).catch(() => {}));
	const saved = await shell.match(SHELL_KEY);
	if (!saved) return net;
	return Promise.race([
		net.then((res) => (res.ok ? res : saved)).catch(() => saved),
		new Promise((r) => setTimeout(() => r(saved), NAV_TIMEOUT_MS)),
	]);
}

/** Saved copy if we have it, otherwise fetch once and keep it */
async function keepFirst(url, cors) {
	const shell = await caches.open(SHELL);
	const hit = await shell.match(url);
	if (hit) return hit;
	let res;
	try {
		res = await fetch(url, cors ? { mode: "cors", credentials: "omit" } : undefined);
	} catch {
		// CORS refused: an opaque copy still displays fine
		res = await fetch(url, { mode: "no-cors" });
	}
	if (res.ok || res.type === "opaque") await shell.put(url, res.clone());
	return res;
}

async function refreshInBackground(e, req) {
	const shell = await caches.open(SHELL);
	const hit = await shell.match(req.url);
	const net = fetch(req)
		.then((res) => {
			if (res.ok) e.waitUntil(shell.put(req.url, res.clone()));
			return res;
		})
		.catch(() => hit || Response.error());
	if (hit) {
		e.waitUntil(net.catch(() => {}));
		return hit;
	}
	return net;
}

/** First visit happens before this worker exists, so grab the page and its build files now */
async function precacheShell() {
	const shell = await caches.open(SHELL);
	const res = await fetch("/", { cache: "no-cache" });
	if (!res.ok) return;
	const html = await res.clone().text();
	await shell.put(SHELL_KEY, res);
	const files = [...html.matchAll(/["'](\/assets\/[^"']+)["']/g)].map((m) => m[1]);
	await warm(files);
}

/** Save files the page already loaded before this worker was in charge */
async function warm(urls) {
	await Promise.all(
		urls.map(async (u) => {
			try {
				const url = new URL(u, self.location.href);
				if (isAudio(url) || DEV_PATHS.test(url.pathname)) return;
				if (url.hostname === ART_HOST || url.pathname.startsWith("/assets/")) {
					await keepFirst(url.href, url.hostname === ART_HOST);
				} else if (url.origin === self.location.origin) {
					const shell = await caches.open(SHELL);
					if (!(await shell.match(url.href))) {
						const res = await fetch(url.href);
						if (res.ok) await shell.put(url.href, res);
					}
				}
			} catch {
				// skip anything that won't come
			}
		})
	);
}
