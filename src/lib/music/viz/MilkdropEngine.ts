/**
 * The milkdud visualizer: MilkDrop visuals through Butterchurn, the open-source
 * WebGL 2 build of Winamp's MilkDrop 2, with the community presets its authors
 * converted (butterchurn-presets, 395 of them across four packs).
 * Ported from wearedogs (src/lib/visualizer/MilkdropEngine.js).
 *
 * Nothing here downloads until milkdud is on: the engine and each preset pack
 * are separate chunks. The first pack starts the show; the rest arrive behind
 * it and join the list.
 *
 * It needs its own canvas: a canvas that has handed out a 2d or WebGL 1
 * context can never hand out a WebGL 2 one.
 */
import { standInWave } from "./standIn";

/** Seconds one preset takes to melt into the next */
const BLEND_SECONDS = 2.7;
/** How long a preset plays before the next one, with auto-advance on */
export const AUTO_ADVANCE_MS = 30000;
/** Phones report 3x and more: MilkDrop at that size cooks them for no visible gain */
const MAX_PIXEL_RATIO = 2;
/** How many presets "previous" can walk back through */
const MAX_HISTORY = 50;
/** Samples per frame butterchurn reads (its fftSize) */
const STAND_IN_SAMPLES = 1024;

/** The preset packs, smallest wait first. Each is its own chunk */
const PACKS = [
	() => import("butterchurn-presets/lib/butterchurnPresets.min.js"),
	() => import("butterchurn-presets/lib/butterchurnPresetsExtra.min.js"),
	() => import("butterchurn-presets/lib/butterchurnPresetsExtra2.min.js"),
	() => import("butterchurn-presets/lib/butterchurnPresetsMD1.min.js"),
];

/** Starts fetching the engine and first pack without running anything, so play feels instant */
export function prefetchMilkdrop(): void {
	import("butterchurn/lib/butterchurn.min.js").catch(() => {});
	PACKS[0]().catch(() => {});
}

/** How deep a bundler may nest a UMD bundle's export under "default" */
const MAX_WRAPS = 3;

/** A UMD bundle's export, whichever way the bundler wrapped it */
function unwrap(module: any, method: string): any {
	let found = module;
	for (let depth = 0; depth < MAX_WRAPS && found && typeof found[method] !== "function"; depth += 1) {
		found = found.default;
	}
	if (!found || typeof found[method] !== "function") throw new Error("MilkDrop bundle has no " + method);
	return found;
}

/** True when this browser can run milkdud at all (it needs WebGL 2) */
export function milkdropSupported(): boolean {
	if (typeof document === "undefined" || typeof (window as any).WebGL2RenderingContext === "undefined") return false;
	try {
		return !!document.createElement("canvas").getContext("webgl2");
	} catch (e) {
		return false;
	}
}

export type EngineListeners = {
	/** the preset on screen changed */
	onPreset?: (name: string) => void;
	/** more presets arrived */
	onNames?: (names: string[]) => void;
};

export class MilkdropEngine {
	canvas: HTMLCanvasElement;
	/** null = no real levels (iPhone / iPad): it dances to the stand-in beat instead */
	analyser: AnalyserNode | null;
	audioCtx: AudioContext | null;
	/** Whether the music is on, for the stand-in beat */
	playing: () => boolean = () => false;
	wave: Uint8Array | null = null;
	visualizer: any = null;
	animationFrameId: number | null = null;
	autoTimer: ReturnType<typeof setTimeout> | null = null;
	destroyed = false;
	/** name -> preset, filled pack by pack */
	presets: Record<string, any> = {};
	names: string[] = [];
	current = "";
	history: string[] = [];
	auto = true;
	/** Auto-advance and "next" pick at random; off, they walk the list in order */
	shuffle = true;
	/** The listener's hearted presets, or null for every preset */
	pool: string[] | null = null;
	/** The preset the last engine was showing: put back on as soon as its pack has loaded */
	resume = "";
	width = 0;
	height = 0;
	onPreset: (name: string) => void;
	onNames: (names: string[]) => void;

	constructor(
		canvas: HTMLCanvasElement,
		analyser: AnalyserNode | null,
		audioCtx: AudioContext | null,
		listeners: EngineListeners = {}
	) {
		this.canvas = canvas;
		this.analyser = analyser;
		this.audioCtx = audioCtx;
		this.onPreset = listeners.onPreset || (() => {});
		this.onNames = listeners.onNames || (() => {});
	}

	/** Fetches the engine and the first pack, then starts drawing. Call once */
	async start(): Promise<void> {
		try {
			const [engine, firstPack] = await Promise.all([import("butterchurn/lib/butterchurn.min.js"), PACKS[0]()]);
			if (this.destroyed) return;
			this.resize();
			this.visualizer = unwrap(engine, "createVisualizer").createVisualizer(this.audioCtx, this.canvas, {
				width: this.width,
				height: this.height,
				pixelRatio: 1,
			});
			// No context: butterchurn runs without Web Audio and gets fed the stand-in beat each frame
			if (this.analyser) this.visualizer.connectAudio(this.analyser);
			else this.wave = new Uint8Array(STAND_IN_SAMPLES);
			this.addPack(firstPack);
			if (!this.resumePreset()) this.random(0);
			this.draw();
			this.loadRemainingPacks();
		} catch (e) {
			console.warn("milkdud could not start:", e);
		}
	}

	async loadRemainingPacks(): Promise<void> {
		for (const load of PACKS.slice(1)) {
			try {
				const pack = await load();
				if (this.destroyed) return;
				this.addPack(pack);
				this.resumePreset();
			} catch (e) {
				// A pack that won't load (offline) leaves the ones that did
			}
		}
	}

	addPack(module: any): void {
		const pack = unwrap(module, "getPresets").getPresets();
		for (const name of Object.keys(pack)) this.presets[name] = pack[name];
		this.names = Object.keys(this.presets).sort((a, b) => a.localeCompare(b));
		this.onNames(this.names);
	}

	/** True once the preset to resume is on screen */
	resumePreset(): boolean {
		const name = this.resume;
		if (!name || !this.presets[name]) return false;
		this.resume = "";
		this.loadPreset(name, 0, false);
		return true;
	}

	/** Matches the drawing size to the canvas's size on the page */
	resize(): void {
		const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
		const width = Math.max(1, Math.round(this.canvas.clientWidth * ratio));
		const height = Math.max(1, Math.round(this.canvas.clientHeight * ratio));
		if (width === this.width && height === this.height) return;
		this.width = width;
		this.height = height;
		this.canvas.width = width;
		this.canvas.height = height;
		if (this.visualizer) this.visualizer.setRendererSize(width, height);
	}

	draw(): void {
		if (this.destroyed) return;
		this.resize();
		if (this.wave) {
			standInWave(this.wave, this.playing());
			this.visualizer.render({ audioLevels: { timeByteArray: this.wave, timeByteArrayL: this.wave, timeByteArrayR: this.wave } });
		} else {
			this.visualizer.render();
		}
		this.animationFrameId = requestAnimationFrame(() => this.draw());
	}

	/** Puts a preset on screen. remember = false when stepping back through history */
	loadPreset(name: string, blend: number = BLEND_SECONDS, remember: boolean = true): void {
		const preset = this.presets[name];
		if (!preset || !this.visualizer) return;
		if (remember && this.current) {
			this.history.push(this.current);
			if (this.history.length > MAX_HISTORY) this.history.shift();
		}
		this.current = name;
		this.visualizer.loadPreset(preset, blend);
		this.onPreset(name);
		this.restartAuto();
	}

	/** Narrows the show to the listener's hearts, or widens it back to all */
	setPool(names: string[] | null): void {
		this.pool = names && names.length ? names : null;
	}

	/** The presets the show moves through: the hearts once any of them have loaded, else all */
	list(): string[] {
		if (!this.pool) return this.names;
		const loaded = this.pool.filter((name) => this.presets[name]);
		return loaded.length ? loaded : this.names;
	}

	random(blend: number = BLEND_SECONDS): void {
		const list = this.list();
		if (!list.length) return;
		let name = this.current;
		while (name === this.current && list.length > 1) {
			name = list[Math.floor(Math.random() * list.length)];
		}
		this.loadPreset(list.indexOf(name) === -1 ? list[0] : name, blend);
	}

	next(): void {
		const list = this.list();
		if (!list.length) return;
		this.loadPreset(list[(list.indexOf(this.current) + 1) % list.length]);
	}

	/** Moves on the way the listener set it: random, or the next in order */
	advance(): void {
		if (this.shuffle) this.random();
		else this.next();
	}

	/** The preset that was on before this one; with none, the one before it in the list */
	previous(): void {
		const list = this.list();
		if (!list.length) return;
		const last = this.history.pop();
		if (last) {
			this.loadPreset(last, BLEND_SECONDS, false);
			return;
		}
		const at = Math.max(0, list.indexOf(this.current));
		this.loadPreset(list[(at - 1 + list.length) % list.length], BLEND_SECONDS, false);
	}

	setAuto(on: boolean): void {
		this.auto = !!on;
		this.restartAuto();
	}

	restartAuto(): void {
		if (this.autoTimer) clearTimeout(this.autoTimer);
		if (!this.auto || this.destroyed) return;
		this.autoTimer = setTimeout(() => this.advance(), AUTO_ADVANCE_MS);
	}

	destroy(): void {
		this.destroyed = true;
		if (this.autoTimer) clearTimeout(this.autoTimer);
		if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
		if (this.visualizer && this.analyser) {
			try {
				this.visualizer.disconnectAudio(this.analyser);
			} catch (e) {
				// Already disconnected
			}
		}
		this.visualizer = null;
		this.presets = {};
	}
}
