// What the visualizers listen to. Both of them (milkdud and the simple one) read the same analyser.
//
// The rule: the music itself must keep playing with the screen off, so it stays out of Web Audio
// wherever it can. Web Audio is what the phone suspends when the screen locks:
//  - Chrome / Android: "tapped". The <audio> element plays on its own; the analyser listens to a
//    copy of its stream (captureStream). Screen off/on can't touch what you hear
//  - iPhone / iPad: no copy to tap, and routing the music through Web Audio is what goes silent
//    with the screen off. So no Web Audio at all: the visualizers draw a stand-in beat (standIn.ts)
//  - Desktop Safari / Firefox: no copy to tap either, so the music runs through the graph
//    ("routed"), and the context is kicked back awake whenever the OS suspends it
//
// Built on the first play. In routed mode only from a click/keypress (a context started without
// one stays suspended, and routed music would be silent), so lock-screen / bluetooth play waits.
// A routed media element can't be un-routed, so this only ever happens once per page.
import { writable } from "svelte/store";

export type Graph = {
	/** null when the music never touches Web Audio (iPhone / iPad) */
	ctx: AudioContext | null;
	/** null = no real levels: draw the stand-in beat */
	analyser: AnalyserNode | null;
	mode: "tapped" | "routed" | "none";
};

/** fftSize 256 = 128 frequency bins, what the simple visualizer was drawn around */
const FFT_SIZE = 256;

export const graph = writable<Graph | null>(null);

let built: Graph | null = null;

// iPhone / iPad (iPadOS reports itself as a Mac with touch)
const isIOS = (): boolean =>
	/iP(hone|od|ad)/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

/**
 * Builds the graph the first time, wakes it after that.
 * @param gesture true when called from a click/keypress
 */
export function ensureGraph(audio: HTMLMediaElement, gesture: boolean = false): Graph | null {
	if (built) {
		if (built.ctx && built.ctx.state !== "running" && !document.hidden) built.ctx.resume().catch(() => {});
		return built;
	}
	const capture = (audio as any).captureStream;
	const canTap = typeof capture === "function";
	if (!canTap && isIOS()) return finish({ ctx: null, analyser: null, mode: "none" });
	if (!canTap && !gesture) return null;

	try {
		const Ctx = window.AudioContext || (window as any).webkitAudioContext;
		const ctx: AudioContext = new Ctx();
		const analyser = ctx.createAnalyser();
		analyser.fftSize = FFT_SIZE;

		if (canTap) {
			// The analyser feeds a muted gain so it keeps getting pulled; the music never goes through here
			const mute = ctx.createGain();
			mute.gain.value = 0;
			analyser.connect(mute);
			mute.connect(ctx.destination);
			if (!tap(audio, capture, ctx, analyser)) {
				ctx.close().catch(() => {});
				return finish({ ctx: null, analyser: null, mode: "none" });
			}
		} else {
			ctx.createMediaElementSource(audio).connect(analyser);
			analyser.connect(ctx.destination);
			// The music is in here now: if the OS suspends the context, wake it or the song goes silent
			ctx.addEventListener("statechange", () => {
				if (ctx.state !== "running" && !audio.paused) ctx.resume().catch(() => {});
			});
		}
		if (ctx.state === "suspended") ctx.resume().catch(() => {});

		const g = finish({ ctx, analyser, mode: canTap ? "tapped" : "routed" });
		document.addEventListener("visibilitychange", () => onVisibility(g));
		return g;
	} catch (e) {
		// No Web Audio: the music still plays, the visuals draw the stand-in beat
		console.warn("no audio graph:", e);
		return finish({ ctx: null, analyser: null, mode: "none" });
	}
}

function finish(g: Graph): Graph {
	built = g;
	graph.set(g);
	return g;
}

/** Listen in on a copy of the element's stream. False if it can't be tapped */
function tap(audio: HTMLMediaElement, capture: () => MediaStream, ctx: AudioContext, analyser: AnalyserNode): boolean {
	try {
		const stream: MediaStream = capture.call(audio);
		let source: AudioNode | null = null;
		const attach = () => {
			try {
				const live = stream.getAudioTracks().filter((t) => t.readyState === "live");
				if (!live.length) return;
				source?.disconnect();
				// Each new song gets a fresh audio track on the stream, so follow the newest one
				source = ctx.createMediaStreamSource(new MediaStream([live[live.length - 1]]));
				source.connect(analyser);
			} catch {
				// keep whatever we had; the music is unaffected either way
			}
		};
		stream.addEventListener("addtrack", attach);
		attach();
		return true;
	} catch {
		// e.g. a response without CORS headers
		return false;
	}
}

/**
 * Hidden: a tapped graph has nothing to draw for, so park it (the music keeps going).
 * A routed one is never parked: the music runs through it. Visible again: wake it straight up
 */
function onVisibility(g: Graph): void {
	if (!g.ctx) return;
	if (document.hidden) {
		if (g.mode === "tapped") g.ctx.suspend().catch(() => {});
	} else {
		g.ctx.resume().catch(() => {});
	}
}
