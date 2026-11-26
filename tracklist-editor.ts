// Dev-only Vite plugin behind the tracklist's edit mode. The player POSTs one album's new order
// (existing tracks by their index in `tracks`, plus any new ones) and this rewrites
// src/lib/music/tracks.ts in place. Only the `new Track(...)` blocks of the edited album move:
// every comment, every other album, and the rest of the file stay byte-for-byte the same.
// Never part of the production build (apply: "serve").
import type { Plugin } from "vite";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROUTE = "/__tracklist";
const TRACKS_FILE = "src/lib/music/tracks.ts";
const ARRAY_START = "export const tracks: Track[] = [";
const MAX_BODY = 1 << 20;

/** One `new Track(...)` entry in the tracks array, as text plus what it points at */
type Block = { start: number; end: number; text: string; src: string; name: string; album: string };
/** What the player sends for each row of the edited album, top to bottom */
type Entry = { i: number } | { add: NewTrack };
type NewTrack = { src: string; name: string; when?: string; where?: string; why?: string };
// base is every track as "album | name", in file order, as the page saw it: a stale page is refused
type Payload = { album: string; base: string[]; entries: Entry[] };

/** How a track is named in the stale-page check. The page sees the same album and name the file holds
 * (its URLs are rewritten for the dev proxy, so they can not be compared). */
export const trackKey = (album: string, name: string) => `${album} | ${name}`;

/** `export const NAME = "value";` constants, so album args written as DOGS_MIXTAPE_ALBUM resolve */
function constants(source: string): Map<string, string> {
	const out = new Map<string, string>();
	for (const m of source.matchAll(/export const ([A-Z_]+) = ("(?:[^"\\]|\\.)*");/g)) out.set(m[1], JSON.parse(m[2]));
	return out;
}

/** Skips a string, line comment or block comment starting at i; returns the index after it, or i */
function skipNonCode(s: string, i: number): number {
	if (s[i] === '"' || s[i] === "'" || s[i] === "`") {
		const quote = s[i];
		for (i++; i < s.length && s[i] !== quote; i++) if (s[i] === "\\") i++;
		return i + 1;
	}
	if (s.startsWith("//", i)) {
		const nl = s.indexOf("\n", i);
		return nl < 0 ? s.length : nl;
	}
	if (s.startsWith("/*", i)) {
		const close = s.indexOf("*/", i + 2);
		return close < 0 ? s.length : close + 2;
	}
	return i;
}

/** Top-level arguments of a call whose "(" is at open, as raw source text, and the index after ")" */
function callArgs(s: string, open: number): { args: string[]; close: number } {
	const args: string[] = [];
	let depth = 0;
	let from = open + 1;
	for (let i = open; i < s.length; ) {
		const next = skipNonCode(s, i);
		if (next !== i) {
			i = next;
			continue;
		}
		const c = s[i];
		if (c === "(" || c === "[" || c === "{") depth++;
		if (c === ")" || c === "]" || c === "}") depth--;
		if ((c === "," && depth === 1) || depth === 0) {
			const arg = s.slice(from, i).trim();
			if (arg) args.push(arg);
			from = i + 1;
		}
		if (depth === 0) return { args, close: i + 1 };
		i++;
	}
	throw new Error("unclosed new Track(");
}

/** Every live (not commented out) `new Track(...)` in the tracks array, in order */
export function parseBlocks(source: string): { blocks: Block[]; arrayEnd: number } {
	const consts = constants(source);
	const value = (arg: string) => (arg.startsWith('"') ? JSON.parse(arg) : consts.get(arg) ?? arg);
	const begin = source.indexOf(ARRAY_START);
	if (begin < 0) throw new Error(`${TRACKS_FILE}: "${ARRAY_START}" not found`);
	const blocks: Block[] = [];
	for (let i = begin + ARRAY_START.length; i < source.length; ) {
		const next = skipNonCode(source, i);
		if (next !== i) {
			i = next;
			continue;
		}
		if (source[i] === "]") return { blocks, arrayEnd: source.lastIndexOf("\n", i) + 1 };
		if (!source.startsWith("new Track(", i)) {
			i++;
			continue;
		}
		const { args, close } = callArgs(source, i + "new Track".length);
		const lineStart = source.lastIndexOf("\n", i) + 1;
		const lineEnd = source.indexOf("\n", close);
		const end = lineEnd < 0 ? source.length : lineEnd + 1; // the trailing "),\n" belongs to the block
		blocks.push({ start: lineStart, end, text: source.slice(lineStart, end), src: value(args[0]), name: value(args[1]), album: value(args[2]) });
		i = end;
	}
	throw new Error(`${TRACKS_FILE}: tracks array never closes`);
}

/** A new entry written the way the file writes them: tabs, double quotes, album constants kept */
function trackSource(t: NewTrack, album: string, consts: Map<string, string>): string {
	const albumArg = [...consts].find(([, v]) => v === album)?.[0] ?? JSON.stringify(album);
	const args = [JSON.stringify(t.src.trim()), JSON.stringify(t.name.trim()), albumArg];
	const optional = [t.when, t.where, t.why].map((v) => (v ?? "").trim());
	const last = optional.reduce((n, v, k) => (v ? k + 1 : n), 0);
	for (const v of optional.slice(0, last)) args.push(JSON.stringify(v));
	return `\tnew Track(\n${args.map((a) => `\t\t${a}`).join(",\n")}\n\t),\n`;
}

/**
 * Rewrites one album. Its tracks keep the slots they already hold in the file, filled in the new
 * order; deletions leave a slot empty, additions go in after the album's last slot.
 */
export function applyAlbumEdit(source: string, p: Payload): string {
	const { blocks, arrayEnd } = parseBlocks(source);
	if (blocks.length !== p.base.length || blocks.some((b, k) => trackKey(b.album, b.name) !== p.base[k])) {
		throw new Error("tracks.ts changed since the page loaded. Reload and try again.");
	}
	const consts = constants(source);
	const eol = source.includes("\r\n") ? "\r\n" : "\n"; // new entries match the file's line endings
	const own = blocks.map((b, k) => k).filter((k) => blocks[k].album === p.album);
	for (const e of p.entries) {
		if ("i" in e && !own.includes(e.i)) throw new Error(`track ${e.i} is not on ${p.album}`);
		if ("add" in e && (!e.add.src?.trim() || !e.add.name?.trim())) throw new Error("a new track needs a file and a name");
	}
	const texts = p.entries.map((e) => ("i" in e ? blocks[e.i].text : trackSource(e.add, p.album, consts).replace(/\n/g, eol)));
	const lastSlot = own.length ? own[own.length - 1] : -1;
	let out = "";
	let cursor = 0;
	let next = 0;
	own.forEach((k) => {
		out += source.slice(cursor, blocks[k].start) + (k === lastSlot ? texts.slice(next).join("") : texts[next] ?? "");
		next++;
		cursor = blocks[k].end;
	});
	if (lastSlot < 0) {
		// An album with no tracks yet: its first ones go at the bottom of the array.
		out += source.slice(cursor, arrayEnd) + texts.join("");
		cursor = arrayEnd;
	}
	return out + source.slice(cursor);
}

export function tracklistEditor(): Plugin {
	return {
		name: "tracklist-editor",
		apply: "serve",
		configureServer(server) {
			const file = resolve(server.config.root, TRACKS_FILE);
			server.middlewares.use(ROUTE, (req, res) => {
				const reply = (status: number, body: object) => {
					res.statusCode = status;
					res.setHeader("Content-Type", "application/json");
					res.end(JSON.stringify(body));
				};
				if (req.method !== "POST") return reply(405, { error: "POST only" });
				let raw = "";
				req.on("data", (chunk) => {
					raw += chunk;
					if (raw.length > MAX_BODY) req.destroy();
				});
				req.on("end", () => {
					try {
						const updated = applyAlbumEdit(readFileSync(file, "utf8"), JSON.parse(raw));
						writeFileSync(file, updated);
						reply(200, { ok: true });
					} catch (err) {
						reply(409, { error: err instanceof Error ? err.message : String(err) });
					}
				});
			});
		},
	};
}
