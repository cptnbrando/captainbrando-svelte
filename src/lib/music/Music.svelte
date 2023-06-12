<script lang="ts">
	import { onMount } from 'svelte';
	import Controls from './Controls.svelte';
	import { Track, tracks } from './tracks';
	import Visualizer from './Visualizer.svelte';

	const songs: Track[] = tracks;
	let track: Track = songs[0];
	let trackNum: number = 0;
	let lastTrackArray: number[] = [];

	let isPlaying: boolean = false;

	let audioPlayer: HTMLAudioElement;
	let time: number = 0;
	let duration: number = 0;
	let loop: boolean = false;
	let shuffle: boolean = true;
	let volume: number = 30;
	let ended: boolean = false;

	let mousePos = { x: 500, y: 250 };

	export let isMobile: boolean = false;

	/**
	 * Random track on launch
	 */
	onMount(async () => {
		trackNum = Math.floor(Math.random() * songs.length);
		track = songs[trackNum];
		audioPlayer.load();
	});

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

	function chooseTrack(trackName: string): void {
		// Pause the track if it's playing, then push the track num to the array
		if (isPlaying) playPause();

		lastTrackArray.push(trackNum);

		trackNum = songs.findIndex(track => {
			return track.name === trackName;
		});
		track = songs[trackNum];
		audioPlayer.load();
		if (!isPlaying) playPause();
	}

	/**
	 * Callback for all Controls functions
	 * @param event the message
	 */
	function handleCmd(event): void {
		if(event.detail.track) {
			chooseTrack(event.detail.track);
			return;
		}
		switch (event.detail.cmd) {
			case 'playPause':
				playPause();
				break;
			case 'next':
				changeTrack(1);
				break;
			case 'prev':
				changeTrack(-1);
				break;
			case 'shuffle':
				shuffle = !shuffle;
				break;
			case 'loop':
				loop = !loop;
				break;
			default:
				seek(event.detail.cmd);
				break;
		}
	}

	export let scrollEvent: any;

	$: AudioInfo = {
		audioPlayer: audioPlayer,
		track: track,
		duration: duration,
		time: time,
		shuffle: shuffle,
		loop: loop,
		ended: ended,

		isPlaying: isPlaying
	};
</script>

<div
	ref="box"
	id="musicBox"
	on:mousemove={(e) => onMousemove(e)}
>
	<Visualizer {isPlaying} audioElement={audioPlayer} {scrollEvent} {mousePos} />
	<Controls on:message={handleCmd} {...AudioInfo} {isMobile} />
</div>
<audio
	data-playing="no"
	crossOrigin="anonymous"
	{loop}
	volume={volume / 100}
	bind:this={audioPlayer}
	bind:duration
	bind:ended
	bind:currentTime={time}
	on:ended={() => changeTrack(1)}
>
	<source src={track.src} type="audio/mp3" />
</audio>

<style>
	:global([ref='box']) {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
	}
</style>
