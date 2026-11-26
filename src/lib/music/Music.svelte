<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { fade } from "svelte/transition";
	import { PlayIcon } from "svelte-feather-icons";
	import PlayerBar from "./PlayerBar.svelte";
	import Library from "./Library.svelte";
	import { Track, defaultTracks, newestTrack, tracks, isMixtape, MIXTAPE_SUFFIX } from "./tracks";
	import Visualizer from "./Visualizer.svelte";
	import Milkdud from "./viz/Milkdud.svelte";
	import MilkdudDeck from "./viz/MilkdudDeck.svelte";
	import { graph, ensureGraph } from "./viz/audioGraph";
	import { milkdropSupported, prefetchMilkdrop } from "./viz/MilkdropEngine";
	import * as deck from "./viz/presetDeck";

	const TREASURE = "captainbrando-treasure";

	const songs: Track[] = tracks;
	let track: Track = songs[0];
	let trackNum: number = 0;
	let lastTrackArray: number[] = [];

	let isPlaying: boolean = false;

	let audioPlayer: HTMLAudioElement;
	let time: number = 0;
	let duration: number = 0;
	// repeatMode: 0 = off, 1 = repeat album, 2 = repeat one, 3 = ◆ show performance mode (stop when the song ends)
	let repeatMode: number = 0;
	let loop: boolean = false;
	$: loop = repeatMode === 2;
	let shuffle: boolean = false;
	let volume: number = 0.82;
	let ended: boolean = false;

	let mousePos = { x: 500, y: 250 };

	export let isMobile: boolean = false;

	// --- Which visualizer: milkdud (MilkDrop presets, the default) or the simple one ---
	const VIZ_KEY = "captainbrando-viz";
	const CAN_MILKDUD = milkdropSupported();
	type VizMode = "milkdud" | "simple";

	function readViz(): VizMode {
		if (!CAN_MILKDUD) return "simple";
		try {
			return localStorage.getItem(VIZ_KEY) === "simple" ? "simple" : "milkdud";
		} catch {
			return "milkdud";
		}
	}

	let vizMode: VizMode = readViz();

	function toggleViz(): void {
		if (!CAN_MILKDUD) return;
		vizMode = vizMode === "milkdud" ? "simple" : "milkdud";
		deckListOpen = false;
		try {
			localStorage.setItem(VIZ_KEY, vizMode);
		} catch {
			// Not kept: lasts until the page closes
		}
	}

	// --- The gates (album + track drawer) ---
	let libraryOpen: boolean = false;
	let deckListOpen: boolean = false;

	// --- Idle: after a few still seconds the milkdud deck (and the bar, in fullscreen) gets out of the way ---
	const IDLE_MS = 3000;
	let idle: boolean = false;
	let idleTimer: ReturnType<typeof setTimeout>;

	function wake(): void {
		idle = false;
		clearTimeout(idleTimer);
		idleTimer = setTimeout(() => (idle = true), IDLE_MS);
	}

	$: hideChrome = idle && isPlaying && !libraryOpen && !deckListOpen;

	$: if (track) {
		useCache(track);
	}

	const useCache = async (track) => {
		const myTreasure = await caches.open(TREASURE);
		const foundTrack = await myTreasure.match(track.src);
		if (foundTrack) {
			return foundTrack;
		}

		const networkRes = await fetch(track.src);
		if (networkRes.ok) {
			await myTreasure.put(track.src, networkRes.clone());
		}

		return networkRes;
	};

	/**
	 * Random track on launch
	 */
	onMount(async () => {
		// To share tracks easily, we can attach the name of the .mp3 and play that one instead of random if a query param exists
		const queryParams = new URLSearchParams(window.location.search);
		let song = queryParams.get("song"); // 'song' is the query param you want

		if (song) {
			handleQueryParam(song);
		} else {
			// loadRandomTrack(); // picks from defaultTracks (the two mixtapes)
			// For now, open on the newest track
			trackNum = newestTrack;
			track = songs[trackNum];
		}

		audioPlayer.load();
		// Get the milkdud's code downloading now, so the first play doesn't wait on it
		if (vizMode === "milkdud") prefetchMilkdrop();
		wake();

		audioPlayer.addEventListener("pause", () => {
			isPlaying = false;
		});

		// Keep fullscreen state synced even when the user exits with Esc
		const onFsChange = () => {
			isFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
		};
		document.addEventListener("fullscreenchange", onFsChange);
		document.addEventListener("webkitfullscreenchange", onFsChange);
	});

	onDestroy(() => clearTimeout(idleTimer));

	let isFullscreen: boolean = false;
	// iPhones can only fullscreen a <video>, so there it's "theater": the player covers the page instead
	let theater: boolean = false;
	let musicBox: HTMLElement;

	$: immersive = isFullscreen || theater;

	/**
	 * Fullscreen the player (visuals + bar), or exit if already in it
	 */
	function toggleFullscreen(): void {
		if (theater) {
			theater = false;
			return;
		}
		if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
			const doc = document as any;
			if (doc.exitFullscreen) doc.exitFullscreen();
			else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
			return;
		}
		const el = musicBox as any;
		if (el.requestFullscreen) el.requestFullscreen().catch(() => (theater = true));
		else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
		else theater = true;
	}

	function loadRandomTrack() {
		trackNum = defaultTracks[Math.floor(Math.random() * defaultTracks.length)];
		track = songs[trackNum];
	}

	/**
	 * Load the shared track. A mixtape reissue shares its .mp3 with the original album,
	 * so ?song=BEGIN.mp3-mixtape picks the mixtape copy; plain ?song=BEGIN.mp3 lands on
	 * the original album copy
	 */
	function handleQueryParam(song: string) {
		console.log(`handleQueryParam ${song}`);
		const wantTape = song.endsWith(MIXTAPE_SUFFIX);
		const file = wantTape ? song.slice(0, -MIXTAPE_SUFFIX.length) : song;
		const matches = songs.map((el, i) => i).filter((i) => songs[i].src.includes(file));
		trackNum = matches.find((i) => isMixtape(songs[i].album) === wantTape) ?? matches[0] ?? -1;
		// DEFAULT TO WHACK A MOLE
		if (trackNum == -1) handleQueryParam("whackamole3.mp3");
		else track = songs[trackNum];
	}

	/**
	 * Update mouse position for visualizer
	 * @param event mouse event
	 */
	function onMousemove(event: MouseEvent) {
		mousePos = { x: event.clientX, y: event.clientY };
		wake();
	}

	/**
	 * Helper for getting the last track from the array, pops it or checks shuffle to get a random or go back sequentially
	 */
	function trackArrayHelper(): number {
		if (lastTrackArray.length !== 0) return lastTrackArray.pop();
		else return shuffle ? randomTrack() : trackNum - 1;
	}

	/**
	 * New random track, no duplicates
	 */
	function randomTrack(): number {
		let newRand = Math.floor(Math.random() * (songs.length - 1));
		if (newRand === trackNum) {
			return randomTrack();
		}
		return newRand;
	}

	/**
	 * Change the track
	 * @param num -1 to prev, 1 to next
	 */
	function changeTrack(num: number) {
		// Pause the track if it's playing, then push the track num to the array
		if (isPlaying) playPause();
		if (loop) {
			audioPlayer.load();
			playPause();
			return;
		}
		if (num > 0) lastTrackArray.push(trackNum);

		// If skipping, check shuffle and get a random track or go to the next one
		// If prev, send to helper function
		let nextNum = 0;
		if (num > 0) nextNum = shuffle ? randomTrack() : trackNum + 1;
		else nextNum = trackArrayHelper();

		// If it's out of bounds, wrap it around
		if (nextNum >= songs.length) nextNum = 0;
		if (nextNum < 0) nextNum = songs.length - 1;

		// Set the new trackNum, load and play if not playing
		trackNum = nextNum;
		track = songs[trackNum];
		audioPlayer.load();
		if (!isPlaying) playPause();
	}

	/**
	 * Toggles isPlaying after calling pause() or play() on audioPlayer
	 */
	function playPause(): void {
		if (isPlaying) audioPlayer.pause();
		else {
			// The first play builds the audio graph the visualizers listen to,
			// inside this click/keypress so the browser lets it make sound
			ensureGraph(audioPlayer);
			audioPlayer.play()?.catch(() => (isPlaying = false));
		}
		isPlaying = !isPlaying;
	}

	/**
	 * Change time of track
	 * @param time where to seek to
	 */
	function seek(time: number): void {
		audioPlayer.currentTime = time;
	}

	/**
	 * Change volume of track
	 * @param volume what to change it to
	 */
	function changeVol(volume: number): void {
		audioPlayer.volume = volume;
	}

	function chooseTrack(idx: number): void {
		// Pause the track if it's playing, then push the track num to the array
		if (isPlaying) playPause();

		lastTrackArray.push(trackNum);

		trackNum = idx;
		track = songs[trackNum];
		audioPlayer.load();
		if (!isPlaying) playPause();
		// On a phone the drawer covers the visuals: get it out of the way once a song is picked
		if (isMobile) libraryOpen = false;
	}

	function gimme(): void {
		window.open(track.src, "_blank");
	}

	/**
	 * Next track within the current album, wrapping back to its first song
	 * (random within the album when shuffle is on)
	 */
	function nextInAlbum(): number {
		const albumIdxs = songs.map((t, i) => i).filter((i) => songs[i].album === track.album);
		if (albumIdxs.length <= 1) return trackNum;
		if (shuffle) {
			let pick = trackNum;
			while (pick === trackNum) pick = albumIdxs[Math.floor(Math.random() * albumIdxs.length)];
			return pick;
		}
		return albumIdxs[(albumIdxs.indexOf(trackNum) + 1) % albumIdxs.length];
	}

	/**
	 * repeat album keeps spinning the current album;
	 * ◆ show performance mode holds the silence when the song ends —
	 * play restarts it from the top, prev/next/picking a track behave as usual
	 */
	function onEnded(): void {
		if (repeatMode === 3) {
			isPlaying = false;
			audioPlayer.currentTime = 0;
			return;
		}
		if (repeatMode === 1) {
			chooseTrack(nextInAlbum());
			return;
		}
		changeTrack(1);
	}

	/**
	 *
	 * ---- START HERE IF YOU WANNA ADD NEW SHIT -----
	 *
	 * Callback for every PlayerBar / Library command
	 * Name it, make it do a function, keep it snappy!
	 * @param event the message
	 */
	function handleCmd(event): void {
		if (event.detail.trackIdx !== undefined) {
			chooseTrack(event.detail.trackIdx);
			return;
		}
		switch (event.detail.cmd) {
			case "playPause":
				playPause();
				break;
			case "next":
				changeTrack(1);
				break;
			case "prev":
				changeTrack(-1);
				break;
			case "shuffle":
				shuffle = !shuffle;
				break;
			case "loop":
				repeatMode = (repeatMode + 1) % 4;
				break;
			case "download":
				gimme();
				break;
			case "fullscreen":
				toggleFullscreen();
				break;
			case "library":
				libraryOpen = !libraryOpen;
				break;
			case "viz":
				toggleViz();
				break;
			default:
				const str = event.detail.cmd;
				if (str.includes("volume=")) {
					const volumeStr = str.split("volume=")[1];
					const volume = parseFloat(volumeStr);
					changeVol(volume);
				} else {
					const volumeStr = str.split("seek=")[1];
					// const volume = parseFloat(volumeStr);
					seek(volumeStr);
				}
				break;
		}
	}

	/**
	 * Keyboard controls: space = play/pause, arrows = prev/next, s = shuffle, r = repeat,
	 * v = milkdud/simple, l = the gates, f = fullscreen, [ ] = milkdud presets, h = heart the preset
	 */
	function onKeydown(e: KeyboardEvent) {
		// Let focused inputs and the seek slider keep their own key behavior
		const target = e.target;
		if (
			target instanceof HTMLElement &&
			(target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable ||
				target.getAttribute("role") === "slider")
		) {
			return;
		}
		if (e.metaKey || e.ctrlKey || e.altKey) return;
		wake();

		switch (e.code) {
			case "Space":
				e.preventDefault(); // stop the page from scrolling (and a focused button from clicking too)
				playPause();
				break;
			case "ArrowRight":
				changeTrack(1);
				break;
			case "ArrowLeft":
				changeTrack(-1);
				break;
			case "KeyS":
				shuffle = !shuffle;
				break;
			case "KeyR":
				repeatMode = (repeatMode + 1) % 4;
				break;
			case "KeyV":
				toggleViz();
				break;
			case "KeyL":
				libraryOpen = !libraryOpen;
				break;
			case "KeyF":
				toggleFullscreen();
				break;
			case "BracketLeft":
				deck.previous();
				break;
			case "BracketRight":
				deck.next();
				break;
			case "KeyH":
				if (vizMode === "milkdud") deck.toggleFavorite();
				break;
			case "Escape":
				if (deckListOpen) deckListOpen = false;
				else if (libraryOpen) libraryOpen = false;
				else if (theater) theater = false;
				break;
		}
	}
</script>

<svelte:window on:keydown={onKeydown} on:pointerdown={wake} />
<div
	id="musicBox"
	bind:this={musicBox}
	class="flex flex-col bg-white {theater ? 'fixed inset-0 z-[60]' : 'relative h-full w-full'} {hideChrome && immersive
		? 'cursor-none'
		: ''}"
	on:mousemove={(e) => onMousemove(e)}
>
	<!-- The stage. Double-tap the open water to go fullscreen -->
	<section
		class="overflow-hidden {immersive ? 'absolute inset-0' : 'relative min-h-0 flex-1'} {vizMode === 'milkdud'
			? 'bg-black'
			: 'bg-white'}"
		on:dblclick={(e) => {
			if (e.target === e.currentTarget || e.target instanceof HTMLCanvasElement) toggleFullscreen();
		}}
	>
		{#if vizMode === "milkdud"}
			<Milkdud />
			{#if !$graph}
				<!-- Before the first play there's no sound to draw: show the record instead -->
				<div
					class="absolute inset-0 flex items-center justify-center overflow-hidden {libraryOpen && !isMobile ? 'pr-[32rem]' : ''}"
					out:fade={{ duration: 500 }}
				>
					<img src={track.img} alt="" class="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-2xl" />
					<button type="button" class="group relative flex flex-col items-center gap-4" title="play  space" on:click={() => playPause()}>
						<span class="relative block">
							<img
								src={track.img}
								alt="album art"
								class="block h-44 w-44 border-[3px] border-black object-cover shadow-[8px_8px_0_#000] transition-transform group-hover:-translate-y-1 md:h-64 md:w-64"
							/>
							<span
								class="absolute inset-0 flex items-center justify-center text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100"
							>
								<PlayIcon size="64" />
							</span>
						</span>
						<span
							class="border-[3px] border-black bg-white px-3 py-1 font-mono text-xs font-bold uppercase shadow-[4px_4px_0_#000] group-hover:bg-brand group-hover:text-white"
							>press play, wake the milkdud</span
						>
					</button>
				</div>
			{:else}
				<div
					class="absolute left-3 right-3 top-3 z-20 flex justify-end transition-opacity duration-500 {hideChrome
						? 'pointer-events-none opacity-0'
						: ''}"
				>
					<MilkdudDeck bind:listOpen={deckListOpen} />
				</div>
			{/if}
		{:else}
			<Visualizer {isPlaying} {mousePos} {isMobile} />
		{/if}

		{#if libraryOpen}
			<Library {track} {isPlaying} {isMobile} on:message={handleCmd} />
		{/if}
	</section>

	<div
		class="transition-transform duration-300 {immersive ? 'absolute inset-x-0 bottom-0 z-40' : ''} {immersive && hideChrome
			? 'translate-y-full'
			: ''}"
	>
		<PlayerBar
			{track}
			{isPlaying}
			{time}
			{duration}
			{shuffle}
			{repeatMode}
			{vizMode}
			canMilkdud={CAN_MILKDUD}
			{libraryOpen}
			fullscreen={immersive}
			{isMobile}
			on:message={handleCmd}
		/>
	</div>
</div>
<audio
	data-playing="no"
	crossOrigin="anonymous"
	{loop}
	bind:volume
	bind:this={audioPlayer}
	bind:duration
	bind:ended
	bind:currentTime={time}
	on:ended={onEnded}
>
	<source src={track.src} type="audio/mp3" />
</audio>
