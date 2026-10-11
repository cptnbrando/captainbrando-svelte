// Captain Brando's treasure chest: keeps the site and every song you've heard, forever.
//
// - Songs: saved whole the first time you hear one (the page sends "keep" once it plays). The
//   download the player streams from is split so the same bytes are held to the side, and
//   "keep" moves that copy in (no second download). After that, always played from here, seeking
//   included (Range requests answered from the copy). Never expires.
//   If the .mp3 on R2 is swapped out, a tiny HEAD check (at most every CHECK_EVERY per song,
//   only while online) spots the new Last-Modified / size and downloads the new version on the
//   side. It replaces the old copy the next time that song starts, never mid-song
// - Site: index.html is network-first (new deploys land) with the saved copy as the fallback;
//   hashed /assets/* and album art are saved on first sight and never refetched

// Same name the old in-page cache used, so songs saved before this worker carry over
const TREASURE = "captainbrando-treasure";
// New versions of saved songs wait here until the next time that song starts
const STAGED = "captainbrando-treasure-next";
// Songs downloaded for the player but not heard yet (a preload on page load, say)
const PENDING = "captainbrando-treasure-pending";
const SHELL = "captainbrando-shell";
const SHELL_KEY = "/index.html";
const NAV_TIMEOUT_MS = 3000;
const CHECK_EVERY = 6 * 60 * 60 * 1000;
const DOWNLOAD_WAIT_MS = 60000;
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
	const url = req.url;
	const range = req.headers.get("range");
	// A play starts at byte 0. Seeks mid-song ask for later bytes
	const fromStart = !range || /^bytes=0-/.test(range.trim());

	// A new version of this song finished downloading earlier: swap it in now, at the start of a
	// play, never in the middle of one (two different files mixed together = garbled audio)
	if (fromStart) await promoteStaged(url);

	const saved = await caches.match(url, { cacheName: TREASURE });
	if (saved) {
		if (fromStart) e.waitUntil(checkForNewVersion(url, saved));
		return slice(saved, range);
	}
	const held = await caches.match(url, { cacheName: PENDING });
	if (held) return slice(held, range);

	// Not on the device yet. When the player asks for the whole file from the top, download it
	// once and split it: one copy plays, the other is kept to the side. No second download
	if ((!range || /^bytes=0-$/.test(range.trim())) && !downloading.has(url) && !saving.has(url)) {
		try {
			return await playAndKeep(e, url, range);
		} catch {
			// fall through to a plain network request
		}
	}
	return fetch(req);
}

// Downloads split off the player's stream. They land in PENDING, not TREASURE: the page also
// preloads songs nobody has pressed play on, and only songs actually heard count as saved
const downloading = new Map();

async function playAndKeep(e, url, range) {
	const res = await fetch(url, { mode: "cors", credentials: "omit" });
	const size = Number(res.headers.get("content-length"));
	if (res.status !== 200 || !res.body || !size) return res;
	const [toPlayer, toCache] = res.body.tee();
	const keep = (async () => {
		try {
			// put() only commits once every byte has arrived, so a cut-off download keeps nothing
			const pending = await caches.open(PENDING);
			await pending.put(url, new Response(toCache, { headers: res.headers }));
			// Only the last few unplayed preloads are worth holding on to
			const keys = await pending.keys();
			for (const old of keys.slice(0, Math.max(0, keys.length - 3))) await pending.delete(old);
		} catch {
			// cut off mid-download
		} finally {
			if (downloading.get(url) === keep) downloading.delete(url);
		}
	})();
	downloading.set(url, keep);
	e.waitUntil(keep);
	const headers = {
		"Content-Type": res.headers.get("content-type") || "audio/mpeg",
		"Content-Length": String(size),
		"Accept-Ranges": "bytes",
	};
	if (!range) return new Response(toPlayer, { status: 200, headers });
	return new Response(toPlayer, {
		status: 206,
		headers: { ...headers, "Content-Range": `bytes 0-${size - 1}/${size}` },
	});
}

const saving = new Map();

/**
 * Keep a song for good once it's been heard: use the copy already downloaded for the player
 * if there is one, otherwise download it. With revalidate, download a new version of a saved
 * song into STAGED instead. A broken download never replaces a good copy
 */
function saveSong(url, revalidate = false) {
	// Separate slots: a "keep" for a song must never swallow a new-version download of it
	const slot = (revalidate ? "next " : "") + url;
	if (!saving.has(slot)) {
		saving.set(
			slot,
			(async () => {
				try {
					if (!revalidate) {
						if (await caches.match(url, { cacheName: TREASURE })) return tell(url);
						if (downloading.has(url)) {
							// A connection that just hangs must not hold the save up forever
							const dl = downloading.get(url);
							const gaveUp = await Promise.race([dl.then(() => false), new Promise((r) => setTimeout(() => r(true), DOWNLOAD_WAIT_MS))]);
							if (gaveUp && downloading.get(url) === dl) downloading.delete(url);
						}
						if (await moveFromPending(url)) return tell(url);
					}
					const res = await fetch(url, {
						mode: "cors",
						credentials: "omit",
						cache: revalidate ? "no-cache" : "default",
					});
					if (res.status !== 200) return;
					// put() only commits once the whole body has arrived
					await (await caches.open(revalidate ? STAGED : TREASURE)).put(url, res);
					if (!revalidate) tell(url);
				} catch {
					// offline / cut off mid-download: try again next listen
				} finally {
					saving.delete(slot);
				}
			})()
		);
	}
	return saving.get(slot);
}

async function moveFromPending(url) {
	const pending = await caches.open(PENDING);
	const copy = await pending.match(url);
	if (!copy) return false;
	await (await caches.open(TREASURE)).put(url, copy);
	await pending.delete(url);
	return true;
}

async function promoteStaged(url) {
	const staged = await caches.open(STAGED);
	const next = await staged.match(url);
	if (!next) return;
	await (await caches.open(TREASURE)).put(url, next);
	await staged.delete(url);
	tell(url);
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
	// Registered first, so it clones before the browser starts reading the body.
	// Only the site's own page counts: opening a PDF or image directly must not replace it
	e.waitUntil(
		net
			.then((res) => res.ok && (res.headers.get("content-type") || "").includes("text/html") && shell.put(SHELL_KEY, res.clone()))
			.catch(() => {})
	);
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
