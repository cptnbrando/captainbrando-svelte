<script lang="ts">
	// The milkdud stage: a WebGL 2 canvas running MilkDrop presets off the player's audio.
	// The engine is built once the audio graph exists (first play) and torn down with
	// this component, so switching to the simple view frees the GPU.
	import { onDestroy } from "svelte";
	import { graph } from "./audioGraph";
	import { MilkdropEngine } from "./MilkdropEngine";
	import * as deck from "./presetDeck";

	/** Whether the music is on: the stand-in beat (iPhone / iPad) only moves while it is */
	export let isPlaying: boolean = false;

	let canvas: HTMLCanvasElement;
	let engine: MilkdropEngine | null = null;

	$: if ($graph && canvas && !engine) start();

	function start() {
		engine = new MilkdropEngine(canvas, $graph.analyser, $graph.ctx, deck.listeners());
		engine.playing = () => isPlaying;
		deck.attach(engine);
		engine.start();
	}

	onDestroy(() => {
		if (!engine) return;
		deck.detach(engine);
		engine.destroy();
		engine = null;
	});
</script>

<canvas bind:this={canvas} class="absolute inset-0 block h-full w-full" />
