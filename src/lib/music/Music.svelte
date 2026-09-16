<script lang="ts">
	import { onMount } from "svelte";
	import Controls from "./Controls.svelte";
	import { Track, defaultTracks, tracks, isMixtape, MIXTAPE_SUFFIX } from "./tracks";
	import Visualizer from "./Visualizer.svelte";

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
			// loadRandomTrack();
			trackNum = 0;
			track = songs[trackNum];
		}

		audioPlayer.load();

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

	let isFullscreen: boolean = false;

	/**
	 * Fullscreen the whole page (nav + visualizer) or exit if already in it
	 */
	function toggleFullscreen(): void {
		if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
			const doc = document as any;
			if (doc.exitFullscreen) doc.exitFullscreen();
			else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
			return;
		}
		const el = document.querySelector("main") as any;
		if (!el) return;
		if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
		else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
	}

	function loadRandomTrack() {
		// trackNum = defaultTracks[Math.floor(Math.random() * defaultTracks.length)];
		trackNum = Math.floor(Math.random() * songs.length);
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
		isPlaying ? audioPlayer.pause() : audioPlayer.play();
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
	 * Callback for all Controls functions
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
	 * Keyboard controls: space = play/pause, arrows = prev/next, s = shuffle, r = repeat
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

		switch (e.code) {
			case "Space":
				e.preventDefault(); // stop the page from scrolling
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
		}
	}

	$: AudioInfo = {
		audioPlayer: audioPlayer,
		track: track,
		duration: duration,
		time: time,
		shuffle: shuffle,
		repeatMode: repeatMode,
		ended: ended,
		volume: volume,
		isPlaying: isPlaying,
		fullscreen: isFullscreen,
	};
</script>

<svelte:window on:keydown={onKeydown} />
<div id="musicBox" class="relative h-full w-full" on:mousemove={(e) => onMousemove(e)}>
	<Visualizer {isPlaying} audioElement={audioPlayer} {mousePos} {isMobile} />
	<Controls on:message={handleCmd} {...AudioInfo} {isMobile} />
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
