<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		RepeatIcon,
		ShuffleIcon,
		SkipBackIcon,
		SkipForwardIcon,
		ChevronUpIcon,
		ChevronDownIcon,
		PauseIcon,
		PlayIcon,
		DownloadIcon,
		Share2Icon
	} from 'svelte-feather-icons';
	import { fade, fly } from 'svelte/transition';
	import { type Track, type Album, tracks } from './tracks';
	import { albums } from './tracks';
	import RangeSlider from 'svelte-range-slider-pips';

	export let isMobile: boolean;

	export let track: Track;
	export let isPlaying: boolean;
	let showControls: boolean = true;

	export let shuffle: boolean;
	export let loop: boolean;

	let isSeeking: boolean = false;

	let list: boolean = false;
	let selected: Album = albums[0];
	let selectedTracks: Track[] = tracks.filter(track => {
		return selected.name === track.album;
	});

	$: selected, onSelect();

	let stats: boolean = false;

	function onSelect() {
		selectedTracks = tracks.filter(track => {
			return selected.name === track.album;
		});
	}

	// Event dispatcher + command function to relay actions back to Music.svelte
	const dispatch = createEventDispatcher();

	function command(cmd: string) {
		dispatch('message', {
			cmd: cmd
		});
	}

	function chooseTrack(track: string) {
		dispatch('message', {
			track: track
		});
	}

	// Duration updates
	export let duration;
	let _duration: string;
	$: duration, onDuration();

	function onDuration() {
		_duration = formatTime(duration * 1000);
	}

	// Current time updates
	export let time;
	let extraTime = 0;
	let _time: string = '0:00';
	$: time, onTime();

	function onTime() {
		if (!isSeeking) extraTime = time;
		_time = formatTime(time * 1000);
	}

	/**
	 * Format a given milisecond value into a string with leading 0s
	 * @param miliseconds given time in ms
	 */
	function formatTime(miliseconds: number): string {
		if (!miliseconds || miliseconds < 1000) {
			return `0:00`;
		}

		let seconds: number | string = Math.floor((miliseconds / 1000) % 60);
		let minutes: number | string = Math.floor((miliseconds / (1000 * 60)) % 60);

		// Format each section with a leading 0 if needed
		// minutes = (minutes < 10) ? "0" + minutes : minutes;
		seconds = seconds < 10 ? '0' + seconds : seconds;

		// If it's more than an hour, return the hour too. Otherwise, just the min:sec
		return `${minutes}:${seconds}`;
	}

	function toggleList() {
		list = !list;
		(!showControls && list) ? showControls = true : showControls = false;
	}

	function shareSong() {
		const trackSrcArr = track.src.split("/");
		const baseUrl = window.location.origin;  // Get the base URL (e.g., https://captainbrando.com or http://localhost:3000)
		const lastFieldOfTrackURL = trackSrcArr[trackSrcArr.length - 1];  // Get the last item in the url 'github.com/blah/track.mp3 trackSrcArr
		const fullUrl = `${baseUrl}/?song=${lastFieldOfTrackURL}`;  // Construct the URL with the song query param
		const msg = document.querySelector(".ghost") as HTMLElement;
		if(navigator.clipboard) {
			navigator.clipboard.writeText(fullUrl)
			.then(() => {
			  // Notify the user that the text was copied successfully
			  flashVisibility(msg);
			});
		} else {
			msg.innerHTML = "No HTTPS ?";
			// Notify the user that the text cannot be copied
			flashVisibility(msg);
		}
	}

	const goBack: string = '<- go back';

	function flashVisibility(el: HTMLElement) {
		el.style.visibility = "visible";
		setTimeout(() => {
			el.style.visibility = "hidden";
		}, 2000);
	}
</script>

<div ref="box" id="controlsBox">
	<div id="boxie">
		{#if (list)}
			<div id="list" in:fly="{{ y: 600, duration: 400 }}" out:fly="{{ y: 600, duration: 300 }}">
				<div id="albums">
					<ul>						
						{#each albums as album}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<li on:click={() => {selected = album; stats = false;}} class="{selected === album && !stats ? 'active' : ''}">
							<img src={album.src} alt="" />
							<span>{album.name}</span>
						</li>
						{/each}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<li on:click={() => {stats = !stats;}} class="{stats ? 'active' : 'colors'}">
							<span>Stats</span>
						</li>
					</ul>
				</div>
				<div id="tracklist">
					{#if stats}
						<br />
						<span>Thanks for listening :)</span>
						<p>Most songs written and performed by me except for the ones with friends 
							<a href="https://www.instagram.com/honeydutheband/" target="_blank">(Cigs Inside is now 𝘩𝘰𝘯𝘦𝘺𝘥ü, check them out here)</a>
						</p>
						<p>
							<a href="https://www.youtube.com/watch?v=uzTMHcWtP2Q">(Check out The Cut Ties here!)</a>
						</p>
						<p>All tracks recorded and produced by me in dorm rooms, cars, bars, airplanes, or bathrooms (always with dogs/cats)</p>
						<p>Now I make music at my apt in plano TX 😜. I stay quiet most days, meditation and video games</p>
						<p>Feel free to download and use anything you like, post it wherever too just please credit me</p>
					{:else}
						<!-- <span class="redHover">{goBack}</span> -->
						<span>
								<img src={selected.src} alt="" />
								<h3>{selected.name} by {selected.artist}</h3>
						</span>
						<ol>
							{#each selectedTracks as listTrack}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<li on:click={() => {chooseTrack(listTrack.name)}} class="{track.name === listTrack.name ? 'active' : ''}">
								{listTrack.name}
							</li>
							{/each}
						</ol>
					{/if}
				</div>
			</div>
		{/if}
	</div>
	<div id="seeker">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div id="img" on:click={toggleList} class="clickable redHover">
			<img src={track.img} alt="" />
			{#if !list}
			<h3 class="whattodowhattodo gold">openthegates</h3>
			{:else}
			<h3 class="whattodowhattodo purp">ah close em!</h3>
			{/if}
			<span class={list ? 'red' : ''}>
				{#if !list}
				<ChevronUpIcon size="40" />
				{:else}
				<ChevronDownIcon class="red" size="40" />
				{/if}
			</span>
		</div>
		<div id="controller">
			<div class="wide">
				<span id="mobileControls" class="icons">
					<span>
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<span class="button" on:click={() => command('prev')}>
							<SkipBackIcon size="40" />
						</span>
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<span class="button" on:click={() => command('playPause')}>
							{#if isPlaying}
								<PauseIcon size="40" />
							{:else}
								<PlayIcon size="40" />
							{/if}
						</span>
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<span class="button" on:click={() => command('next')}>
							<SkipForwardIcon size="40" />
						</span>
					</span>
					<span id="secondaryIcons">
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<span on:click={() => command('shuffle')} class={shuffle ? 'active button' : 'button'}>
							<ShuffleIcon size="25" />
						</span>
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<span on:click={() => command('loop')} class={loop ? 'active button' : 'button'}>
							<RepeatIcon size="25" />
						</span>
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<span id="shareBtn" class="button clickable redHover" on:click={shareSong}>
							<Share2Icon size=25 />
						</span>
						<div></div>
						<span class="ghost">copied to clip🛹!</span>
						<!-- <span on:click={() => window.open(track.src, '_blank')} class='button'>
							<DownloadIcon size="25" />
						</span> -->
					</span>
				</span>
			</div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div ref="box" class="clickable redHover" id="track" on:click={toggleList}>
				{#if !isMobile}
				{track.artist} - 
				{/if}
				{track.name}
			</div>
			<div id="seek">
				<span>{_time}</span>
				<span>
					<RangeSlider
						values={[extraTime]}
						min={0}
						max={duration}
						on:start={() => {
							isSeeking = true;
						}}
						on:stop={(e) => {
							command(e.detail.value);
							isSeeking = false;
						}}
					/>
				</span>
				<span>{_duration}</span>
			</div>
		</div>
	</div>
</div>

<style lang="scss">

	$red: #E62020;

	.ghost {
		visibility: hidden;
	}

	.gold {
		color: blue;

	}

	.purp {
		color: red;
	}

	#secondaryIcons {
		margin-left: 6px;
	}

	#albums {
		ul {
			margin: 0;
			padding: 0;
			li {
				border: 1px solid $red;
				display: flex;
				align-items: center;
				justify-content: left;

				img {
					width: 25px;
					height: 25px;
				}
			}
		}
	}

	.red {
		color: $red;
	}

	.redHover {
		transition: 0.2s;
		&:hover {
			cursor: pointer;
			color: $red;
		}
	}

	#controlsBox {
		position: absolute;
		top: 0;
		z-index: 10;
		// padding-top: 67px;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		overflow: hidden;
		max-height: 100%;
		
		
		#boxie {
			height: 100%;
			display: flex;
			justify-content: space-around;
			align-items: center;
			overflow: hidden;
			max-height: 100%;
		}
	}

	.icons {
		width: 100%;
		align-items: center;
		display: flex;
		justify-content: space-between;

		span {
			span {
				cursor: pointer;
				transition: 0.3s;
				&:hover {
					color: gray;
					transform: scale(1.3);
				}
	
				&:active {
					color: $red;
				}
			}
		}

		.active {
			color: $red;
	
			&:hover {
				color: $red;
				transform: scale(1.3);
			}
		}
	}

	.button {
		padding: .3rem;
	}

	#seeker {
		display: flex;
		align-items: flex-end;
		padding: 12px;
		justify-content: flex-start;
		border-top: solid;

		div:last-child {
			display: flex;
			flex-direction: column;
			width: 100%;
			align-items: center;

			div {
				flex-direction: row;
			}
		}
	}

	img {
		width: 90px;
		height: 90px;
		margin: 10px;
		border: solid;
	}

	#img {
		width: 100%;
		height: 100%;
		flex: 0.2;
		position: relative;

		img {
			position: relative;
			z-index: 1;
		}

		span {
			position: absolute;
			z-index: 10;
			left: 33%;
			top: 25%;
		}
	}

	#track {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	#seek {
		margin: 10px;

		span {
			display: flex;
			flex: 1;
			justify-content: center;
			align-items: center;
			height: 40%;
			width: 100%;

			&:nth-child(2) {
				flex: 10;
				display: block;
			}
		}
	}

	.wide {
		width: 100%;
	}

	#list {
		width: 100%;
		background-color: rgba(224, 226, 198, .8);
		display: flex;
		height: 100%;

		#albums, #tracklist {
			display: block;
			height: 100%;
			padding-left: 10px;
			padding-right: 10px;
			overflow-y: auto;
			height: 100%;
			max-height: 100%;
		}

		li {
			&:hover {
				text-decoration: underline;
				cursor: pointer;
				color: $red;
			}
		}

		div:first-child {
			flex: .3;
			border-right: solid;
			li {
				list-style: symbols(cyclic ">");
				text-align: start;
				padding: 5px;
				border-left: 1px solid $red;
				border-right: 1px solid $red;
				border-bottom: 1px solid $red;

				&:first-child {
					border-top: 1px solid $red;
				}

				&:hover {
					text-decoration: underline;
					cursor: pointer;
					color: $red;
				}
			}

			.active {
				font-weight: bold;
				list-style: symbols(cyclic ">>");
				border: 3px solid #9932CC;
			}
		}

		div:last-child {
			flex: 1;
		}

		.active {
			font-weight: bold;
			list-style: symbols(cyclic ">>");
		}
	}

	#mobileControls {
		display: flex;
		width: 100%;
		height: 100%;
		justify-content: center;
		padding-top: .5em;
		padding-bottom: .5em;
		align-items: center;
		flex-direction: column;
	}

	#controller {
		margin-left: 10px;
		margin-right: 10px;
	}

	.clickable {
		cursor: pointer;
	}

	.whattodowhattodo {
		padding-top: 9px;
	}

	@media only screen and (max-width: 800px) {
		#list {
			div:first-child {
				flex: .8;
			}
		}

		li {
			padding: 5px;
		}
	}
</style>
