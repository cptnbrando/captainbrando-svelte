<script lang="ts">
	// The simple view: the original captainbrando visualizer (blue/orange spikes + the sun circles).
	// It reads the shared audio graph (viz/audioGraph.ts) instead of building its own.
	import { afterUpdate, onDestroy, onMount } from "svelte";
	import { graph } from "./viz/audioGraph";

	// Typed array to hold the audio frequency data
	const NUM_SAMPLES = 256;

	// Create a new array of 8-bit integers (0-255)
	let audioData = new Uint8Array(NUM_SAMPLES / 2);

	export let isPlaying: boolean;

	export let isMobile: boolean;

	let isAnimating: boolean = false;
	let animationLoopID: number = 0;

	let onMusic: boolean = true;

	let canvasElement!: HTMLCanvasElement;
	let drawCtx!: CanvasRenderingContext2D;

	let analyserNode: AnalyserNode | null = null;
	$: analyserNode = $graph ? $graph.analyser : null;

	let invert: boolean = false;
	let waveSpace: number = 0;
	let waveRange: number = 0;
	let maxRadius = 200;

	export let mousePos = { x: 500, y: 250 };

	let width: number = 0;
	let height: number = 0;

	let resizeObserver: ResizeObserver;

	onMount(async () => {
		await setupCanvas();
		await resizeCanvas();
		await beginInactive();
		// Follow the stage's size (drawer, fullscreen, rotation), not just the window's
		resizeObserver = new ResizeObserver(onResize);
		resizeObserver.observe(canvasElement.parentElement);
	});

	onDestroy(() => {
		stopVisualizer();
		resizeObserver?.disconnect();
	});

	afterUpdate(() => {
		isPlaying === true && analyserNode ? beginVisualizer() : "";
	});

	function beginInactive(): void {
		// Stop any animations currently going on
		stopVisualizer();
		isAnimating = true;
		inactiveText();
	}

	function inactiveText(): void {
		drawCtx.strokeStyle = makeColor(0, 0, 0, 255);
		drawCtx.clearRect(0, 0, drawCtx.canvas.clientWidth, drawCtx.canvas.clientHeight);
		drawCtx.font = "48px serif";
		const widthAdjust = isMobile ? 60 : 20;
		drawCtx.strokeText("inactive", width / 2 - widthAdjust, height / 2 - 80);
	}

	function setupCanvas(): void {
		drawCtx = <CanvasRenderingContext2D>canvasElement.getContext("2d");
	}

	function beginVisualizer(): void {
		// Stop any animations currently going on
		stopVisualizer();

		if (analyserNode && canvasElement && !isAnimating) {
			drawCtx.clearRect(0, 0, drawCtx.canvas.clientWidth, drawCtx.canvas.clientHeight);
			isAnimating = true;
			render();
		}
	}

	function stopVisualizer(): void {
		window.cancelAnimationFrame(animationLoopID);
		isAnimating = false;
	}

	function render(): void {
		update();
		animationLoopID = window.requestAnimationFrame(render.bind(this));
	}

	function update(): void {
		if (!onMusic || !analyserNode) return;
		/*
        Nyquist Theorem
        http://whatis.techtarget.com/definition/Nyquist-Theorem
        The array of data we get back is 1/2 the size of the sample rate
        */

		// populate the audioData with the frequency data
		analyserNode.getByteFrequencyData(audioData);

		const height = canvasElement.height;
		const halfH = height / 2;
		const width = canvasElement.width;

		const red = makeColor(255, 140, 0, 255);
		const blue = makeColor(0, 191, 255, 255);
		const sun = makeColor(255, 111, 111, 1);

		// const xRatio = mousePos.x / window.innerWidth;
		// const yRatio = mousePos.y / window.innerHeight;

		// const midpoint = (505 * xRatio) + 55;
		// const highPoint = halfH / 2 + (yRatio * 300);
		const midpoint = 15;
		const highPoint = halfH;

		// DRAW!
		drawCtx.clearRect(0, 0, width, height);

		waveSpace = (mousePos.x / window.innerWidth) * 8;
		waveRange = (mousePos.y / window.innerHeight) * 255;

		// viewPos = (mousePos.x / window.innerWidth) *

		// loop through the data and draw!
		audioData.map((data, i) => {
			const base = (i + 0.5) * midpoint;
			drawCtx.beginPath();
			drawCtx.strokeStyle = blue;
			drawCtx.moveTo(i * midpoint, highPoint);

			// Top shapes
			switch (data > 156) {
				case true:
					drawCtx.lineTo(base - waveSpace, halfH - data);
					drawCtx.lineTo(base + waveSpace, halfH - data);
					break;
				case false:
					drawCtx.lineTo(base + waveSpace, halfH + data);
					drawCtx.lineTo(base - waveSpace, halfH + data);
					break;
			}

			drawCtx.lineTo((i + 1) * midpoint, highPoint);
			drawCtx.stroke();
			drawCtx.closePath();

			drawCtx.beginPath();
			drawCtx.strokeStyle = red;
			if (invert) {
				drawCtx.strokeStyle = blue;
			}
			drawCtx.moveTo(i * midpoint, highPoint);

			// Reflections
			switch (data < 156) {
				case true:
					drawCtx.lineTo(base - waveSpace, halfH - data);
					drawCtx.lineTo(base + waveSpace, halfH - data);
					break;
				case false:
					drawCtx.lineTo(base + waveSpace, halfH + data);
					drawCtx.lineTo(base - waveSpace, halfH + data);
					break;
			}

			drawCtx.lineTo((i + 1) * midpoint, highPoint);
			drawCtx.stroke();
			drawCtx.closePath();

			// Sun circles
			const percent = data / 255;
			const circleRadius = percent * maxRadius + waveRange;

			drawCtx.beginPath();
			drawCtx.fillStyle = sun;
			drawCtx.arc(width, 0, circleRadius * 0.5, 0, 2 * Math.PI, false);
			drawCtx.stroke();
			drawCtx.closePath();

			drawCtx.beginPath();
			drawCtx.fillStyle = sun;
			drawCtx.arc(width, 0, circleRadius * 0.5, 0, 2 * Math.PI, false);
			drawCtx.stroke();
			drawCtx.closePath();

			return data;
		});
	}

	function makeColor(red: number, green: number, blue: number, alpha: number): string {
		return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
	}

	function resizeCanvas(): void {
		const viz = canvasElement?.parentElement;
		if (viz) {
			width = viz.clientWidth;
			height = viz.clientHeight;
		}
		if (canvasElement) {
			canvasElement.width = width;
			canvasElement.height = height;
		}
		if (drawCtx) {
			drawCtx.canvas.width = width;
			drawCtx.canvas.height = height;
		}
	}

	function onResize() {
		resizeCanvas();
		// Resizing wipes the canvas, so repaint the idle state if nothing's playing
		if (drawCtx && !isPlaying) {
			beginInactive();
		}
	}
</script>

<canvas bind:this={canvasElement} {width} {height} class="absolute inset-0 block h-full w-full" />
