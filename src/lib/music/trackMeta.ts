// Dates, year colors and the stats page numbers for the tracklist (moved out of the old Controls.svelte)
import { type Track, tracks, isMixtape } from "./tracks";

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_MS = 86400000;

export type Stamp = { year: string; monthIdx: number; month: string; day: number; time: string };

// Parse the timestamp string literally (no timezone conversion) so it reads
// exactly as it was written down at the time
export function parseStamp(stamp: string): Stamp | null {
	const m = stamp.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
	if (!m) return null;
	let hour = parseInt(m[4]);
	const ampm = hour >= 12 ? "pm" : "am";
	hour = hour % 12 || 12;
	return {
		year: m[1],
		monthIdx: parseInt(m[2]) - 1,
		month: MONTHS[parseInt(m[2]) - 1],
		day: parseInt(m[3]),
		time: `${hour}:${m[5]}${ampm}`,
	};
}

export function firstStamp(t: Track): Stamp | null {
	return t.when ? parseStamp(t.when.split(" to ")[0]) : null;
}

// Short version for the chip: aug 25 2026
export function glanceDate(when: string): string {
	if (!when) return "story";
	const d = parseStamp(when.split(" to ")[0]);
	return d ? `${d.month} ${d.day} ${d.year}` : "story";
}

// Long version for the expanded entry: aug 25, 2026 · 1:20pm (→ range if two stamps)
export function fullDate(when: string): string {
	return when
		.split(" to ")
		.map((s) => {
			const d = parseStamp(s);
			return d ? `${d.month} ${d.day}, ${d.year} · ${d.time}` : s;
		})
		.join("  →  ");
}

// A chip is only expandable when there's an actual story to show
export function hasDetails(t: Track): boolean {
	return !!(t.where || t.why);
}

// --- Year color coding for the date chips ---
// Tailwind needs literal class names, so these are spelled out per year
const YEAR_BASE: Record<string, string> = {
	"2020": "border-amber-700 text-amber-700",
	"2021": "border-emerald-700 text-emerald-700",
	"2022": "border-sky-700 text-sky-700",
	"2023": "border-pink-700 text-pink-700",
	"2024": "border-lime-700 text-lime-700",
	"2025": "border-teal-700 text-teal-700",
	"2026": "border-brand text-brand",
};
const YEAR_HOVER: Record<string, string> = {
	"2020": "hover:bg-amber-700",
	"2021": "hover:bg-emerald-700",
	"2022": "hover:bg-sky-700",
	"2023": "hover:bg-pink-700",
	"2024": "hover:bg-lime-700",
	"2025": "hover:bg-teal-700",
	"2026": "hover:bg-brand",
};
const YEAR_OPEN: Record<string, string> = {
	"2020": "bg-amber-700 text-white",
	"2021": "bg-emerald-700 text-white",
	"2022": "bg-sky-700 text-white",
	"2023": "bg-pink-700 text-white",
	"2024": "bg-lime-700 text-white",
	"2025": "bg-teal-700 text-white",
	"2026": "bg-brand text-white",
};
const YEAR_FALLBACK = "border-neutral-500 text-neutral-600";

function trackYear(t: Track): string {
	const d = firstStamp(t);
	return d ? d.year : "";
}

export function chipBase(t: Track): string {
	return YEAR_BASE[trackYear(t)] ?? YEAR_FALLBACK;
}

export function chipHover(t: Track): string {
	return YEAR_HOVER[trackYear(t)] ?? "hover:bg-neutral-500";
}

export function chipOpen(t: Track): string {
	return YEAR_OPEN[trackYear(t)] ?? "bg-neutral-500 text-white";
}

// --- Stats ---
// The mixtapes are reissues of songs already on board, so keep them out of the numbers
export const statTracks = tracks.filter((t) => !isMixtape(t.album));

export const oldest = statTracks.reduce(
	(best, t) => {
		const s = firstStamp(t);
		if (!s) return best;
		const time = Date.UTC(parseInt(s.year), s.monthIdx, s.day);
		return !best || time < best.time ? { track: t, stamp: s, time } : best;
	},
	null as { track: Track; stamp: Stamp; time: number } | null
);

const now = new Date();
const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

// Days until this track's next (or most recent) release-date anniversary,
// negative = it just passed. Handles the year wrap at new year's.
function birthdayDiff(s: Stamp): number {
	let best: number = null;
	for (const y of [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1]) {
		const diff = Math.round((new Date(y, s.monthIdx, s.day).getTime() - todayMid) / DAY_MS);
		if (best === null || Math.abs(diff) < Math.abs(best)) best = diff;
	}
	return best;
}

export function relLabel(diff: number): string {
	if (diff === 0) return "today";
	if (diff === -1) return "yesterday";
	if (diff < 0) return "a couple days ago";
	if (diff === 1) return "tomorrow";
	const weekday = WEEKDAYS[new Date(todayMid + diff * DAY_MS).getDay()];
	return diff <= 6 ? `this ${weekday}` : `next ${weekday}`;
}

const birthdays = statTracks
	.map((t) => ({ track: t, stamp: firstStamp(t) }))
	.filter((b) => b.stamp)
	.map((b) => ({ ...b, diff: birthdayDiff(b.stamp) }))
	.filter((b) => b.diff >= -4 && b.diff <= 13)
	.sort((a, b) => a.diff - b.diff);

export const releasedToday = birthdays.filter((b) => b.diff === 0);
export const upcomingBirthdays = birthdays.filter((b) => b.diff !== 0);

/** Format seconds as m:ss */
export function formatTime(seconds: number): string {
	if (!seconds || seconds < 1 || !isFinite(seconds)) return "0:00";
	const s = Math.floor(seconds % 60);
	const m = Math.floor(seconds / 60);
	return `${m}:${s < 10 ? "0" + s : s}`;
}
