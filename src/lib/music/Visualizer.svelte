<script lang="ts">
	import { afterUpdate, onDestroy, onMount } from "svelte";

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

	export let audioElement: HTMLMediaElement;
	let audioCtx!: AudioContext;
	let sourceNode!: AudioNode;
	// true = we only listen in on a copy of the stream (captureStream) and the <audio> element
	// still plays on its own, so the screen going off / on can't touch what you hear
	let tapped: boolean = false;
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
		await setupCanvas();
		await resizeCanvas();
		await beginInactive();
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
		drawCtx.clearRect(0, 0, drawCtx.canvas.clientWidth, drawCtx.canvas.clientHeight);
		drawCtx.font = "48px serif";
		const widthAdjust = isMobile ? 60 : 20;
		drawCtx.strokeText("inactive", width / 2 - widthAdjust, height / 2 - 80);
	}

	// iPhone / iPad (iPadOS reports itself as a Mac with touch)
	const isIOS = (): boolean =>
		/iP(hone|od|ad)/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

	function setupWebaudio(): void {
		if (!audioElement) return;
		const capture = (audioElement as any).captureStream;

		// iPhone / iPad have no way to tap a copy, and running the music itself through Web Audio
		// is what goes silent with the screen off. Leave the music alone and draw a stand-in beat
		if (typeof capture !== "function" && isIOS()) return;

		const AudioContext = window.AudioContext;
		audioCtx = new AudioContext();

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
		analyserNode.connect(gainNode);
		gainNode.connect(audioCtx.destination);

		if (typeof capture === "function") {
			// Chrome / Android: tap a copy of the stream. The analyser feeds a muted gain so it keeps
			// getting pulled, and the music itself never goes through Web Audio
			tapped = true;
			gainNode.gain.value = 0;
			try {
				const stream: MediaStream = capture.call(audioElement);
				const attach = () => {
					try {
						const live = stream.getAudioTracks().filter((t) => t.readyState === "live");
						if (!live.length) return;
						sourceNode?.disconnect();
						// Each new track gets a fresh audio track on the stream, so follow the newest one
						sourceNode = audioCtx.createMediaStreamSource(new MediaStream([live[live.length - 1]]));
						sourceNode.connect(analyserNode);
					} catch {
						// keep whatever we had; the music is unaffected either way
					}
				};
				stream.addEventListener("addtrack", attach);
				attach();
			} catch {
				// Couldn't tap (e.g. a response without CORS headers): stand-in beat, music untouched
				analyserNode = null;
				audioCtx.close().catch(() => {});
				audioCtx = null;
				return;
			}
		} else {
			// Safari / Firefox: no captureStream, so the music has to run through the graph.
			// Keep the context alive or the music goes silent with the screen off
			sourceNode = audioCtx.createMediaElementSource(audioElement);
			sourceNode.connect(analyserNode);
			audioCtx.addEventListener("statechange", keepAlive);
		}

		document.addEventListener("visibilitychange", onVisibility);
	}

	function keepAlive(): void {
		if (audioCtx && audioCtx.state !== "running" && !audioElement.paused) audioCtx.resume().catch(() => {});
	}

	/**
	 * Hidden: a tapped visualizer has nothing to draw, so park the context (the music keeps going).
	 * Visible again: wake it straight back up
	 */
	function onVisibility(): void {
		if (!audioCtx) return;
		if (document.hidden) {
			if (tapped) audioCtx.suspend().catch(() => {});
		} else {
			audioCtx.resume().catch(() => {});
		}
	}

	onDestroy(() => {
		document.removeEventListener("visibilitychange", onVisibility);
		stopVisualizer();
		audioCtx?.close().catch(() => {});
	});

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
		if (!document.hidden) audioCtx?.resume().catch(() => {});
		if (audioElement && canvasElement && !isAnimating) {
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

	/**
	 * Real frequency data when we can listen in; otherwise (iPhone / iPad, or a failed tap)
	 * a stand-in beat of drifting waves so the screen still moves with the music on
	 */
	function readLevels(): void {
		if (analyserNode) {
			analyserNode.getByteFrequencyData(audioData);
			return;
		}
		if (!audioElement || audioElement.paused) {
			audioData.fill(0);
			return;
		}
		const t = performance.now() / 1000;
		for (let i = 0; i < audioData.length; i++) {
			const wave = 0.5 + 0.5 * Math.sin(t * 2.1 + i * 0.35) * Math.sin(t * 0.7 + i * 0.11);
			audioData[i] = 20 + 210 * wave * (1 - i / audioData.length);
		}
	}

	function update(): void {
		if (!onMusic) return;
		/*
        Nyquist Theorem
        http://whatis.techtarget.com/definition/Nyquist-Theorem
        The array of data we get back is 1/2 the size of the sample rate
        */

		// populate the audioData with the frequency data
		readLevels();

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
		const viz = document.querySelector("#musicBox");
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

<svelte:window on:resize={onResize} />
<canvas bind:this={canvasElement} {width} {height} class="absolute inset-0 block h-full w-full" />
