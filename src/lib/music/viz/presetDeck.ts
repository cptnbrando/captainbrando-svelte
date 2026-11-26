// The listener's side of the milkdud show: which presets they love, whether the
// show sticks to those, whether it shuffles, and whether it moves on by itself.
// One deck for the page, kept in localStorage. The engine (MilkdropEngine.ts)
// only exists while milkdud is on screen, so the deck is told when one comes and goes.
// Ported from wearedogs' presetDeck.svelte.js (minus the tether).
import { get, writable } from "svelte/store";
import type { MilkdropEngine } from "./MilkdropEngine";

const STORAGE_KEY = "captainbrando-milkdud-deck";
const MAX_FAVORITES = 500;

type Stored = { favorites?: string[]; favoritesOnly?: boolean; shuffle?: boolean; auto?: boolean };

function readStored(): Stored {
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {};
	} catch {
		return {};
	}
}

const stored = readStored();

/** Every preset loaded so far, sorted. Empty until milkdud has started once */
export const names = writable<string[]>([]);
/** The preset on screen */
export const current = writable<string>("");
/** Hearted presets, oldest first */
export const favorites = writable<string[]>(
	Array.isArray(stored.favorites) ? stored.favorites.filter((n) => typeof n === "string").slice(0, MAX_FAVORITES) : []
);
/** Play only the hearted presets */
export const favoritesOnly = writable<boolean>(stored.favoritesOnly === true);
/** Moving on picks at random; off, it goes down the list */
export const shuffle = writable<boolean>(stored.shuffle !== false);
/** A new preset every 30s */
export const auto = writable<boolean>(stored.auto !== false);
/** True while an engine is on screen and listening */
export const live = writable<boolean>(false);

let engine: MilkdropEngine | null = null;

function save(): void {
	try {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ favorites: get(favorites), favoritesOnly: get(favoritesOnly), shuffle: get(shuffle), auto: get(auto) })
		);
	} catch {
		// Not kept: the choices last until the page closes
	}
}

/** Hands the engine the listener's choices */
function apply(): void {
	if (!engine) return;
	engine.shuffle = get(shuffle);
	engine.setPool(get(favoritesOnly) ? get(favorites) : null);
	engine.setAuto(get(auto));
}

/** What a new engine should be built with, so the deck hears from it */
export function listeners() {
	return {
		onPreset: (name: string) => current.set(name),
		onNames: (list: string[]) => names.set(list),
	};
}

export function attach(e: MilkdropEngine): void {
	engine = e;
	// The show carries on from the preset the last engine left on
	e.resume = get(current);
	e.auto = get(auto);
	e.shuffle = get(shuffle);
	e.setPool(get(favoritesOnly) ? get(favorites) : null);
	live.set(true);
}

export function detach(e: MilkdropEngine): void {
	if (engine === e) {
		engine = null;
		live.set(false);
	}
}

export function toggleFavorite(name: string = get(current)): void {
	if (!name) return;
	favorites.update((list) =>
		list.includes(name) ? list.filter((f) => f !== name) : [...list, name].slice(-MAX_FAVORITES)
	);
	save();
	apply();
}

export function setFavoritesOnly(on: boolean): void {
	favoritesOnly.set(!!on);
	save();
	apply();
}

export function setShuffle(on: boolean): void {
	shuffle.set(!!on);
	save();
	apply();
}

export function setAuto(on: boolean): void {
	auto.set(!!on);
	save();
	apply();
}

export function next(): void {
	engine?.advance();
}

export function previous(): void {
	engine?.previous();
}

export function pick(name: string): void {
	engine?.loadPreset(name);
}
