// A stand-in beat for when there are no real levels to read (iPhone / iPad, where the music stays
// out of Web Audio so it keeps playing with the screen off). Drifting waves with a kick on every
// beat, so the screen still moves with the music on. Flat when it's paused.

const BPM = 120;

/** 0..1, a kick on every beat that fades before the next */
function kick(t: number): number {
	const phase = (t * BPM) / 60;
	return Math.exp(-(phase - Math.floor(phase)) * 5);
}

/** Frequency bins (0..255, low to high), for the simple visualizer */
export function standInFrequency(out: Uint8Array, playing: boolean): void {
	if (!playing) {
		out.fill(0);
		return;
	}
	const t = performance.now() / 1000;
	const k = kick(t);
	for (let i = 0; i < out.length; i++) {
		const wave = 0.5 + 0.5 * Math.sin(t * 2.1 + i * 0.35) * Math.sin(t * 0.7 + i * 0.11);
		const low = 1 - i / out.length;
		out[i] = Math.min(255, 20 + 170 * wave * low + 60 * k * low * low);
	}
}

/** A waveform (0..255, 128 = silence), what milkdud reads */
export function standInWave(out: Uint8Array, playing: boolean): void {
	if (!playing) {
		out.fill(128);
		return;
	}
	const t = performance.now() / 1000;
	const k = kick(t);
	const n = out.length;
	for (let i = 0; i < n; i++) {
		const x = i / n;
		const s =
			(0.25 + 0.55 * k) * Math.sin(x * Math.PI * 6 + t * 3) +
			0.2 * Math.sin(x * Math.PI * 40 + t * 7.3) * Math.sin(t * 0.9) +
			0.1 * Math.sin(x * Math.PI * 130 + t * 13);
		out[i] = Math.max(0, Math.min(255, 128 + 127 * s));
	}
}
