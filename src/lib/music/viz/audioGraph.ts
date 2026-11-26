// One Web Audio graph for the whole player: <audio> → analyser → speakers.
// Both visualizers (milkdud and the simple one) read the same analyser.
//
// It's built on the first play, inside the click/keypress that started it, so
// the browser lets the AudioContext run (and chrome doesn't yell about autoplay).
// Once a media element is routed through Web Audio it can't be un-routed, so
// this only ever happens once per page.
import { writable } from "svelte/store";

export type Graph = { ctx: AudioContext; analyser: AnalyserNode };

/** fftSize 256 = 128 frequency bins, what the simple visualizer was drawn around */
const FFT_SIZE = 256;

export const graph = writable<Graph | null>(null);

let built: Graph | null = null;

/** Builds the graph the first time, resumes it after that. Null if this browser can't. */
export function ensureGraph(audio: HTMLMediaElement): Graph | null {
	if (built) {
		if (built.ctx.state === "suspended") built.ctx.resume().catch(() => {});
		return built;
	}
	try {
		const Ctx = window.AudioContext || (window as any).webkitAudioContext;
		const ctx: AudioContext = new Ctx();
		const source = ctx.createMediaElementSource(audio);
		const analyser = ctx.createAnalyser();
		analyser.fftSize = FFT_SIZE;
		source.connect(analyser);
		analyser.connect(ctx.destination);
		if (ctx.state === "suspended") ctx.resume().catch(() => {});
		built = { ctx, analyser };
		graph.set(built);
		return built;
	} catch (e) {
		// No Web Audio: the music still plays, the visuals just won't react
		console.warn("no audio graph:", e);
		return null;
	}
}
