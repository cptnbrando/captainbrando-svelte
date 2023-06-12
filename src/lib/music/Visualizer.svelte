<script lang="ts">
	import { afterUpdate, onMount } from "svelte";

	// Typed array to hold the audio frequency data
	const NUM_SAMPLES = 256;

	// Create a new array of 8-bit integers (0-255)
	let audioData = new Uint8Array(NUM_SAMPLES / 2);

	export let isPlaying: boolean;

	let isAnimating: boolean = false;
	let animationLoopID: number = 0;

	let canvasElement!: HTMLCanvasElement;
	let drawCtx!: CanvasRenderingContext2D;

	export let audioElement: HTMLMediaElement;
	let audioCtx!: AudioContext;
	let sourceNode!: MediaElementAudioSourceNode;
	let analyserNode!: AnalyserNode;
	let gainNode!: GainNode;

	let invert: boolean = false;
	let waveSpace: number = 0;
	let waveRange: number = 0;
	let maxRadius = 200;

	export let mousePos = { x: 500, y: 250 };

	let width: number = 0;
	let height: number = 0;

	let setup: boolean = false;

	onMount(async () => {
		setupCanvas();
		resizeCanvas();
		beginInactive();
	});

    afterUpdate(() => {
        isPlaying === true ? beginVisualizer() : "";
    });

	function beginInactive(): void {
		// Stop any animations currently going on
		stopVisualizer();
		isAnimating = true;
		inactiveText();
	}

	function inactiveText(): void {
		drawCtx.strokeStyle = makeColor(0, 0, 0, 255);
		drawCtx.clearRect(
			0,
			0,
			drawCtx.canvas.clientWidth,
			drawCtx.canvas.clientHeight
		);
		drawCtx.font = "48px serif";
		drawCtx.strokeText("inactive...", width / 2 - 80, height / 2);
	}

	function setupWebaudio(): void {
		if (!audioElement) return;

		const AudioContext = window.AudioContext;
		audioCtx = new AudioContext();

		// 3 - create an a source node that points at the <audio> element
		sourceNode = audioCtx.createMediaElementSource(audioElement);
		// 4 - create an analyser node
		analyserNode = audioCtx.createAnalyser();

		/*
            We will request NUM_SAMPLES number of samples or "bins" spaced equally
            across the sound spectrum.

            If NUM_SAMPLES (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz,
            the third is 344Hz. Each bin contains a number between 0-255 representing
            the amplitude of that frequency.
        */

		// fft stands for Fast Fourier Transform
		analyserNode.fftSize = NUM_SAMPLES;

		// 5 - create a gain (volume) node
		gainNode = audioCtx.createGain();
		gainNode.gain.value = 1;

		// 6 - connect the nodes - we now have an audio graph
		sourceNode.connect(analyserNode);
		analyserNode.connect(gainNode);
		gainNode.connect(audioCtx.destination);
	}

	function setupCanvas(): void {
		drawCtx = <CanvasRenderingContext2D>canvasElement.getContext("2d");
	}

	function beginVisualizer(): void {
		// Stop any animations currently going on
		stopVisualizer();

		// Hopefully this will stop chrome from yelling about autoplaying...
		if (!setup) {
			setupWebaudio();
			setup = true;
		}
		if (audioElement && canvasElement && !isAnimating) {
			drawCtx.clearRect(
				0,
				0,
				drawCtx.canvas.clientWidth,
				drawCtx.canvas.clientHeight
			);
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

		const red = makeColor(255, 0, 0, 255);
		const blue = makeColor(0, 0, 255, 255);
		const sun = makeColor(255, 111, 111, 1);

		const xRatio = mousePos.x / window.innerWidth;
		const yRatio = mousePos.y / window.innerHeight;

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

			drawCtx.lineTo((i + 1) * (midpoint), highPoint);
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

	function makeColor(
		red: number,
		green: number,
		blue: number,
		alpha: number
	): string {
		return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
	}

	function resizeCanvas(): void {
		const viz = document.querySelector("#musicBox");
		if (viz) {
			width = viz.clientWidth + 4;
			height = viz.clientHeight + 4;
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
	}

	export let scrollEvent: any;
	$: scrollEvent, onScroll();

	function onScroll() {
		if(isAnimating && !isPlaying) {
			beginInactive();
		}
	}
</script>

<svelte:window on:resize={onResize} />
<canvas
	bind:this={canvasElement}
	{width}
	{height}
/>

<style>
	canvas {
		border-top: solid;
		border-bottom: solid;
		width: 100%;
		height: 100%;
	}
</style>
