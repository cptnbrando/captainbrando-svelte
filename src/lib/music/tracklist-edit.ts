// Edit mode for the tracklist: reorder, add and delete tracks on an album, then save the result
// into tracks.ts through the dev server (tracklist-editor.ts at the repo root). Only `npm run dev`
// serves that route, so the edit button never appears on the live site.
import { tracks } from "./tracks";

export const EDITABLE: boolean = import.meta.env.DEV;

const ROUTE = "/__tracklist";

/** A track the form adds. src is a full URL, or a path like 2026/song (the file adds .mp3) */
export type NewTrack = { src: string; name: string; when?: string; where?: string; why?: string };

/** One row of the album being edited: an existing track (its index in `tracks`) or a new one */
export type Row = { key: number; name: string; idx?: number; add?: NewTrack };

/** Must match trackKey in tracklist-editor.ts: how the dev server spots a page older than the file */
const trackKey = (album: string, name: string) => `${album} | ${name}`;

/** The album's rows as they stand in tracks.ts, top to bottom */
export function albumRows(album: string): Row[] {
	return tracks
		.map((t, i) => ({ t, i }))
		.filter(({ t }) => t.album === album)
		.map(({ t, i }) => ({ key: i, idx: i, name: t.name }));
}

/** Moves one row, returning a new array so Svelte sees the change */
export function moveRow(rows: Row[], from: number, to: number): Row[] {
	if (from === to || from < 0 || to < 0 || from >= rows.length || to >= rows.length) return rows;
	const next = rows.slice();
	const [row] = next.splice(from, 1);
	next.splice(to, 0, row);
	return next;
}

/** "2026-11-14T13:05" from a datetime-local input, written the way tracks.ts stamps time: with seconds and this device's UTC offset */
export function stampFromLocal(local: string): string {
	if (!local) return "";
	const offset = -new Date(local).getTimezoneOffset();
	const sign = offset >= 0 ? "+" : "-";
	const hh = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
	const mm = String(Math.abs(offset) % 60).padStart(2, "0");
	return `${local.length === 16 ? local + ":00" : local}${sign}${hh}:${mm}`;
}

/** Right now, for the datetime-local input's starting value */
export function localNow(): string {
	const d = new Date();
	return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

/** Writes the album's new order into tracks.ts. Resolves when the file is saved; Vite then reloads */
export async function saveAlbum(album: string, rows: Row[]): Promise<void> {
	const body = {
		album,
		base: tracks.map((t) => trackKey(t.album, t.name)),
		entries: rows.map((r) => (r.add ? { add: r.add } : { i: r.idx })),
	};
	const res = await fetch(ROUTE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
	if (res.ok) return;
	const msg = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
	throw new Error(msg.error ?? `HTTP ${res.status}`);
}
