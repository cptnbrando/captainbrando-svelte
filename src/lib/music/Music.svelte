<script lang="ts">
	import { onMount } from "svelte";
	import Controls from "./Controls.svelte";
	import { Track, defaultTracks, tracks, isMixtape, MIXTAPE_SUFFIX } from "./tracks";
	import Visualizer from "./Visualizer.svelte";
	import { keepForever, saved, songKey } from "./offline";

	const songs: Track[] = tracks;
	let track: Track = songs[0];
	let trackNum: number = 0;
	let lastTrackArray: number[] = [];

	let isPlaying: boolean = false;
	// What the listener asked for. Survives the gaps between tracks and network hiccups,
	// so auto-advance and recovery know whether to keep the music going
	let wantPlay: boolean = false;

	// Network recovery. When a song won't load or its stream stops moving for STALL_MS,
	// first ask the server about that one file:
	//  - no answer (offline / server down) → it's the connection, never skip for that.
	//    Play saved songs meanwhile, otherwise hold this song and retry with backoff
	//  - the server says the file is missing or broken → skip just that song, and give up
	//    after MAX_BAD_FILES in a row instead of running through the whole list
	const STALL_MS = 15000;
	const PROBE_MS = 8000;
	const RETRY_MS = [10000, 20000, 40000, 60000];
	const MAX_BAD_FILES = 3;
	const MAX_SAVED_HOPS = 3;
	let fails: number = 0; // failures since music last actually played
	let badFiles: number = 0;
	let retries: number = 0;
	let retriedHere: boolean = false;
	let recovering: boolean = false;
	let stallTimer: ReturnType<typeof setTimeout> = null;
	let retryTimer: ReturnType<typeof setTimeout> = null;
	// "" | "waiting for connection…" | "can't load songs right now"
	let status: string = "";

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

		loadTrack();

		audioPlayer.addEventListener("pause", () => {
			isPlaying = false;
			// The OS / a headset paused us (our own pauses before a track swap never reach here,
			// loading the next src drops them). The end of a song isn't the listener stopping, and
			// neither is the pause Chrome fires right after a song fails to load
			if (!audioPlayer.ended && !audioPlayer.error && !recovering) wantPlay = false;
			updatePlaybackState();
		});
		audioPlayer.addEventListener("play", () => {
			isPlaying = true;
			wantPlay = true;
			updatePlaybackState();
		});
		audioPlayer.addEventListener("playing", () => {
			clearStall();
			cancelRetry();
			fails = 0;
			badFiles = 0;
			retries = 0;
			retriedHere = false;
			status = "";
			// Heard it, so keep it forever
			keepForever(track.src);
		});
		audioPlayer.addEventListener("timeupdate", clearStall);
		audioPlayer.addEventListener("waiting", armStall);
		audioPlayer.addEventListener("stalled", armStall);
		audioPlayer.addEventListener("error", recover);
		for (const ev of ["durationchange", "seeked", "ratechange"]) {
			audioPlayer.addEventListener(ev, updatePositionState);
		}

		setupMediaSession();

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
		let newRand = Math.floor(Math.random() * songs.length);
		if (newRand === trackNum) {
			return randomTrack();
		}
		return newRand;
	}

	/**
	 * Change the track
	 * @param num -1 to prev, 1 to next
	 * @param skipLoop move on even in repeat one (the current track won't load)
	 */
	function changeTrack(num: number, skipLoop: boolean = false) {
		if (loop && !skipLoop) {
			audioPlayer.currentTime = 0;
			play();
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

		// Set the new trackNum, load and play
		trackNum = nextNum;
		track = songs[trackNum];
		loadTrack();
		play();
	}

	/**
	 * Point the player at the current track. Set src straight on the element (not through a
	 * <source> child) so a dead link fires "error" on the player itself
	 */
	function loadTrack(): void {
		clearStall();
		cancelRetry();
		retriedHere = false;
		status = "";
		audioPlayer.src = track.src;
	}

	function play(): void {
		wantPlay = true;
		isPlaying = true;
		if (status === "can't load songs right now") status = "";
		// A failed load needs a fresh one before it can play
		if (audioPlayer.error) audioPlayer.src = track.src;
		updatePlaybackState();
		audioPlayer.play()?.catch((e) => {
			// Cut off by a quick skip (AbortError) is fine. Blocked (NotAllowedError, e.g. the phone
			// refused to start audio in the background) means stop cleanly so the lock screen's play works
			if (e?.name === "NotAllowedError") wantPlay = false;
			isPlaying = !audioPlayer.paused;
			updatePlaybackState();
		});
	}

	function pause(): void {
		wantPlay = false;
		isPlaying = false;
		cancelRetry();
		if (status === "waiting for connection…") status = "";
		audioPlayer.pause();
		updatePlaybackState();
	}

	/**
	 * Toggles between play() and pause(). Goes by what the listener asked for, so pressing pause
	 * while waiting out a dead connection stops the waiting too
	 */
	function playPause(): void {
		wantPlay ? pause() : play();
	}

	function armStall(): void {
		if (!wantPlay || stallTimer) return;
		stallTimer = setTimeout(() => {
			stallTimer = null;
			recover();
		}, STALL_MS);
	}

	function clearStall(): void {
		clearTimeout(stallTimer);
		stallTimer = null;
	}

	/**
	 * The current song won't load or its stream stopped moving. Work out whether it's the
	 * connection or the file before doing anything, so a dead connection never turns into
	 * skipping through song after song
	 */
	async function recover(): Promise<void> {
		clearStall();
		if (!wantPlay || recovering) return;
		recovering = true;
		const src = track.src;
		const at = audioPlayer.currentTime;
		try {
			fails++;
			const verdict = await probe(src);			// The listener moved on (or paused) while we were asking
			if (!wantPlay || track.src !== src) return;

			if (verdict === "connection") {
				// Saved songs need no network, so keep the music going with those
				const savedNext = canPlaySaved() && fails <= MAX_SAVED_HOPS ? nextSaved() : -1;
				if (savedNext !== -1) return chooseTrack(savedNext);
				// Nothing saved to fall back on: hold this song (and its spot) until the connection is back
				status = "waiting for connection…";
				isPlaying = false;
				updatePlaybackState();
				return waitForNetwork();
			}

			// The server has the file. A mid-song drop gets one more go from the same spot
			if (verdict === "ok" && at > 0 && !retriedHere) {
				retriedHere = true;
				audioPlayer.src = src;
				audioPlayer.currentTime = at;
				play();
				return;
			}

			// This file is missing or broken: skip just this one, but never run through the list
			if (++badFiles > MAX_BAD_FILES) {
				status = "can't load songs right now";
				wantPlay = false;
				isPlaying = false;
				audioPlayer.pause();
				updatePlaybackState();
				return;
			}
			if (repeatMode === 1) chooseTrack(nextInAlbum());
			else changeTrack(1, true);
		} finally {
			recovering = false;
		}
	}

	/**
	 * Ask the server about one song: "connection" (no answer / server down / offline),
	 * "missing" (the server says it's not there) or "ok" (it's there, the stream just broke)
	 */
	async function probe(src: string): Promise<"connection" | "missing" | "ok"> {
		if (!navigator.onLine) return "connection";
		const ctrl = new AbortController();
		const timer = setTimeout(() => ctrl.abort(), PROBE_MS);
		try {
			const res = await fetch(src, { method: "HEAD", cache: "no-store", signal: ctrl.signal });
			if (res.ok) return "ok";
			return res.status >= 500 || res.status === 408 || res.status === 429 ? "connection" : "missing";
		} catch {
			return "connection";
		} finally {
			clearTimeout(timer);
		}
	}

	// Only lean on saved songs when the service worker is actually there to serve them
	function canPlaySaved(): boolean {
		return "serviceWorker" in navigator && !!navigator.serviceWorker.controller;
	}

	/**
	 * The next saved song after this one (within the album on repeat album, random on shuffle), -1 if none
	 */
	function nextSaved(): number {
		const ok = songs
			.map((t, i) => i)
			.filter(
				(i) =>
					i !== trackNum &&
					(repeatMode !== 1 || songs[i].album === track.album) &&
					$saved.has(songKey(songs[i].src))
			);
		if (!ok.length) return -1;
		if (shuffle) return ok[Math.floor(Math.random() * ok.length)];
		return ok.find((i) => i > trackNum) ?? ok[0];
	}

	/** Try again when the phone says it's back online, or on a slowing timer (10s → 1 min) */
	function waitForNetwork(): void {
		cancelRetry();
		window.addEventListener("online", retryAfterOutage);
		retryTimer = setTimeout(retryAfterOutage, RETRY_MS[Math.min(retries, RETRY_MS.length - 1)]);
		retries++;
	}

	function cancelRetry(): void {
		window.removeEventListener("online", retryAfterOutage);
		clearTimeout(retryTimer);
		retryTimer = null;
	}

	function retryAfterOutage(): void {
		cancelRetry();
		if (!wantPlay) return;
		// Same song, same spot
		const at = audioPlayer.currentTime;
		audioPlayer.src = track.src;
		if (at > 0) audioPlayer.currentTime = at;
		play();
	}

	/**
	 * Media Session: lock screen, notification shade, bluetooth headsets and car stereos.
	 * Only seekto is wired (no seekbackward/seekforward) so iOS shows prev/next instead of ±10s
	 */
	function setupMediaSession(): void {
		if (!("mediaSession" in navigator)) return;
		// iOS 17+: keep audio going with the screen off
		const audioSession = (navigator as any).audioSession;
		if (audioSession) audioSession.type = "playback";

		const handlers: [MediaSessionAction, MediaSessionActionHandler | null][] = [
			["play", () => play()],
			["pause", () => pause()],
			["stop", () => pause()],
			["previoustrack", () => changeTrack(-1)],
			["nexttrack", () => changeTrack(1)],
			["seekto", (d) => d.seekTime !== undefined && seek(d.seekTime)],
			["seekbackward", null],
			["seekforward", null],
		];
		for (const [action, handler] of handlers) {
			try {
				navigator.mediaSession.setActionHandler(action, handler);
			} catch {
				// action not supported by this browser
			}
		}
	}

	$: if (track && typeof navigator !== "undefined" && "mediaSession" in navigator) {
		navigator.mediaSession.metadata = new MediaMetadata({
			title: track.name,
			artist: track.artist,
			album: track.album,
			artwork: [{ src: track.img, sizes: "512x512", type: "image/webp" }],
		});
	}

	function updatePlaybackState(): void {
		if (!("mediaSession" in navigator)) return;
		const on = isPlaying || status === "waiting for connection…";
		navigator.mediaSession.playbackState = on ? "playing" : "paused";
		updatePositionState();
	}

	function updatePositionState(): void {
		if (!("mediaSession" in navigator) || !navigator.mediaSession.setPositionState) return;
		const dur = audioPlayer.duration;
		if (!isFinite(dur) || dur <= 0) return;
		try {
			navigator.mediaSession.setPositionState({
				duration: dur,
				playbackRate: audioPlayer.playbackRate || 1,
				position: Math.min(audioPlayer.currentTime, dur),
			});
		} catch {
			// out-of-range values while a new track loads
		}
	}

	/**
	 * Change time of track
	 * @param time where to seek to
	 */
	function seek(time: number): void {
		audioPlayer.currentTime = time;
		updatePositionState();
	}

	/**
	 * Change volume of track
	 * @param volume what to change it to
	 */
	function changeVol(volume: number): void {
		audioPlayer.volume = volume;
	}

	function chooseTrack(idx: number): void {
		lastTrackArray.push(trackNum);

		trackNum = idx;
		track = songs[trackNum];
		loadTrack();
		play();
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
			wantPlay = false;
			audioPlayer.currentTime = 0;
			updatePlaybackState();
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
		// Waiting out a dead connection still counts as "on", so the button offers pause (which cancels it)
		isPlaying: isPlaying || status === "waiting for connection…",
		fullscreen: isFullscreen,
		status: status,
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
	on:timeupdate={() => (time = audioPlayer.currentTime)}
	on:ended={onEnded}
/>
