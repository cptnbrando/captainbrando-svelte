// Offline music for captainbrando.com.
//
// Songs: every mp3 that plays gets saved to Cache Storage while it streams
// (the first request is teed into the cache, so nothing downloads twice), and
// any saved song is played straight from the phone after that, seeking and
// all. Saved songs never expire.
//
// The site itself (page, js, css, album art) is kept too, so it opens with no
// signal — on a plane, the saved albums just play.

// Same cache the page has always used, so songs saved before this keep working
const SONGS = "captainbrando-treasure";
const SITE = "captainbrando-site";
const IS_DEV = self.location.hostname === "localhost";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
	const req = event.request;
	if (req.method !== "GET") return;
	const url = new URL(req.url);

	if (isSong(url)) return event.respondWith(song(event, req));
	// Dev serves live-reloading modules; keeping them would only cause confusion
	if (IS_DEV) return;
	if (req.mode === "navigate") return event.respondWith(page(req));
	if (url.origin === self.location.origin || isArt(url)) event.respondWith(fresh(req));
});

// data.wearedogs.net/music/..., or /music/... through the dev proxy
const isSong = (url) => url.pathname.startsWith("/music/") && url.pathname.endsWith(".mp3");
const isArt = (url) => url.hostname === "raw.githubusercontent.com";

async function song(event, req) {
	const cache = await caches.open(SONGS);
	const saved = await cache.match(req.url);
	if (saved) return withRange(saved, req.headers.get("range"));

	const range = req.headers.get("range");
	// Only a from-the-top request can be kept whole. Anything else (a seek, or
	// Safari's two-byte probe) just goes to the network.
	if (range && range !== "bytes=0-") return fetch(req);

	// Ask for the whole file; a 200 is a valid answer to "bytes=0-", and the
	// player streams it as it arrives while the other half fills the cache
	const res = await fetch(req.url, { mode: "cors", credentials: "omit" });
	if (res.status !== 200) return res;
	event.waitUntil(
		cache
			.put(req.url, res.clone())
			.then(() => tell({ type: "cached", url: req.url }))
			.catch(() => {})
	);
	return res;
}

// Cut the requested bytes out of a saved song, like a server would
async function withRange(saved, range) {
	const blob = await saved.blob();
	const type = saved.headers.get("content-type") || "audio/mpeg";
	const m = range && /bytes=(\d*)-(\d*)/.exec(range);
	if (!m) {
		return new Response(blob, {
			status: 200,
			headers: { "Content-Type": type, "Content-Length": String(blob.size), "Accept-Ranges": "bytes" },
		});
	}
	const size = blob.size;
	// "bytes=-500" means the last 500 bytes
	let start = m[1] === "" ? size - Number(m[2]) : Number(m[1]);
	let end = m[1] !== "" && m[2] !== "" ? Number(m[2]) : size - 1;
	start = Math.max(0, start);
	end = Math.min(end, size - 1);
	if (start > end) {
		return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
	}
	return new Response(blob.slice(start, end + 1), {
		status: 206,
		headers: {
			"Content-Type": type,
			"Content-Length": String(end - start + 1),
			"Content-Range": `bytes ${start}-${end}/${size}`,
			"Accept-Ranges": "bytes",
		},
	});
}

// The page: newest when online, the saved copy when not
async function page(req) {
	const cache = await caches.open(SITE);
	try {
		const res = await fetch(req);
		if (res.ok) cache.put("/", res.clone());
		return res;
	} catch (e) {
		return (await cache.match("/")) || Response.error();
	}
}

// js / css / images: saved copy right away, refreshed in the background
async function fresh(req) {
	const cache = await caches.open(SITE);
	const saved = await cache.match(req);
	const update = fetch(req)
		.then((res) => {
			if (res.ok || res.type === "opaque") cache.put(req, res.clone());
			return res;
		})
		.catch(() => saved || Response.error());
	return saved || update;
}

async function tell(msg) {
	const clients = await self.clients.matchAll();
	clients.forEach((c) => c.postMessage(msg));
}
