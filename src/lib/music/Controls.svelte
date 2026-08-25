<script lang="ts">
	import { createEventDispatcher } from "svelte";
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
		Share2Icon,
	} from "svelte-feather-icons";
	import { fly, slide } from "svelte/transition";
	import { type Track, type Album, tracks } from "./tracks";
	import { albums } from "./tracks";
	import RangeSlider from "svelte-range-slider-pips";

	const COPY_MSG = "copied to clip🛹!";

	export let isMobile: boolean;

	export let track: Track;
	export let isPlaying: boolean;

	export let shuffle: boolean;
	export let loop: boolean;

	export let volume: number;

	let isSeeking: boolean = false;

	let list: boolean = false;
	let selected: Album = albums[0];
	let selectedTracks: Track[] = tracks.filter((track) => {
		return selected.name === track.album;
	});

	$: selected, onSelect();

	let stats: boolean = false;

	function onSelect() {
		selectedTracks = tracks.filter((track) => {
			return selected.name === track.album;
		});
		expandedStory = null;
	}

	// --- Track stories (when / where / why) ---
	let expandedStory: string = null;

	function toggleStory(trackName: string) {
		expandedStory = expandedStory === trackName ? null : trackName;
	}

	// A chip is only expandable when there's an actual story to show
	function hasDetails(t: Track): boolean {
		return !!(t.where || t.why);
	}

	const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

	// Parse the timestamp string literally (no timezone conversion) so it reads
	// exactly as it was written down at the time
	function parseStamp(stamp: string) {
		const m = stamp.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
		if (!m) return null;
		let hour = parseInt(m[4]);
		const ampm = hour >= 12 ? "pm" : "am";
		hour = hour % 12 || 12;
		return {
			year: m[1],
			monthIdx: parseInt(m[2]) - 1,
			month: MONTHS[parseInt(m[2]) - 1],
			day: parseInt(m[3]),
			time: `${hour}:${m[5]}${ampm}`,
		};
	}

	// Short version for the chip: aug 25 2026
	function glanceDate(when: string): string {
		if (!when) return "story";
		const d = parseStamp(when.split(" to ")[0]);
		return d ? `${d.month} ${d.day} ${d.year}` : "story";
	}

	// --- Year color coding for the date chips ---
	// Tailwind needs literal class names, so these are spelled out per year
	const YEAR_BASE: Record<string, string> = {
		"2020": "border-amber-700 text-amber-700",
		"2021": "border-emerald-700 text-emerald-700",
		"2022": "border-sky-700 text-sky-700",
		"2023": "border-pink-700 text-pink-700",
		"2024": "border-lime-700 text-lime-700",
		"2025": "border-teal-700 text-teal-700",
		"2026": "border-brand text-brand",
	};
	const YEAR_HOVER: Record<string, string> = {
		"2020": "hover:bg-amber-700",
		"2021": "hover:bg-emerald-700",
		"2022": "hover:bg-sky-700",
		"2023": "hover:bg-pink-700",
		"2024": "hover:bg-lime-700",
		"2025": "hover:bg-teal-700",
		"2026": "hover:bg-brand",
	};
	const YEAR_OPEN: Record<string, string> = {
		"2020": "bg-amber-700 text-white",
		"2021": "bg-emerald-700 text-white",
		"2022": "bg-sky-700 text-white",
		"2023": "bg-pink-700 text-white",
		"2024": "bg-lime-700 text-white",
		"2025": "bg-teal-700 text-white",
		"2026": "bg-brand text-white",
	};
	const YEAR_FALLBACK = "border-neutral-500 text-neutral-600";

	function trackYear(t: Track): string {
		const d = t.when ? parseStamp(t.when.split(" to ")[0]) : null;
		return d ? d.year : "";
	}

	function chipBase(t: Track): string {
		return YEAR_BASE[trackYear(t)] ?? YEAR_FALLBACK;
	}

	function chipHover(t: Track): string {
		return YEAR_HOVER[trackYear(t)] ?? "hover:bg-neutral-500";
	}

	function chipOpen(t: Track): string {
		return YEAR_OPEN[trackYear(t)] ?? "bg-neutral-500 text-white";
	}

	// --- Stats ---
	const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	const DAY_MS = 86400000;

	function firstStamp(t: Track) {
		return t.when ? parseStamp(t.when.split(" to ")[0]) : null;
	}

	const oldest = tracks.reduce(
		(best, t) => {
			const s = firstStamp(t);
			if (!s) return best;
			const time = Date.UTC(parseInt(s.year), s.monthIdx, s.day);
			return !best || time < best.time ? { track: t, stamp: s, time } : best;
		},
		null as { track: Track; stamp: ReturnType<typeof parseStamp>; time: number } | null
	);

	const now = new Date();
	const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

	// Days until this track's next (or most recent) release-date anniversary,
	// negative = it just passed. Handles the year wrap at new year's.
	function birthdayDiff(s: ReturnType<typeof parseStamp>): number {
		let best: number = null;
		for (const y of [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1]) {
			const diff = Math.round((new Date(y, s.monthIdx, s.day).getTime() - todayMid) / DAY_MS);
			if (best === null || Math.abs(diff) < Math.abs(best)) best = diff;
		}
		return best;
	}

	function relLabel(diff: number): string {
		if (diff === 0) return "today";
		if (diff === -1) return "yesterday";
		if (diff < 0) return "a couple days ago";
		if (diff === 1) return "tomorrow";
		const weekday = WEEKDAYS[new Date(todayMid + diff * DAY_MS).getDay()];
		return diff <= 6 ? `this ${weekday}` : `next ${weekday}`;
	}

	const birthdays = tracks
		.map((t) => ({ track: t, stamp: firstStamp(t) }))
		.filter((b) => b.stamp)
		.map((b) => ({ ...b, diff: birthdayDiff(b.stamp) }))
		.filter((b) => b.diff >= -4 && b.diff <= 13)
		.sort((a, b) => a.diff - b.diff);

	const releasedToday = birthdays.filter((b) => b.diff === 0);
	const upcomingBirthdays = birthdays.filter((b) => b.diff !== 0);

	// Long version for the expanded entry: aug 25, 2026 · 1:20pm (→ range if two stamps)
	function fullDate(when: string): string {
		return when
			.split(" to ")
			.map((s) => {
				const d = parseStamp(s);
				return d ? `${d.month} ${d.day}, ${d.year} · ${d.time}` : s;
			})
			.join("  →  ");
	}

	// Event dispatcher + command function to relay actions back to Music.svelte
	const dispatch = createEventDispatcher();

	function command(cmd: string) {
		dispatch("message", {
			cmd: cmd,
		});
	}

	function chooseTrack(track: string) {
		dispatch("message", {
			track: track,
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
	let _time: string = "0:00";
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
		seconds = seconds < 10 ? "0" + seconds : seconds;

		// If it's more than an hour, return the hour too. Otherwise, just the min:sec
		return `${minutes}:${seconds}`;
	}

	function toggleList() {
		list = !list;
	}

	function shareSong() {
		const trackSrcArr = track.src.split("/");
		const baseUrl = window.location.origin; // Get the base URL (e.g., https://captainbrando.com or http://localhost:3000)
		const lastFieldOfTrackURL = trackSrcArr[trackSrcArr.length - 1]; // Get the last item in the url 'github.com/blah/track.mp3 trackSrcArr
		const fullUrl = `${baseUrl}/?song=${lastFieldOfTrackURL}`; // Construct the URL with the song query param
		const msg = document.querySelector(".ghost") as HTMLElement;
		if (navigator.clipboard) {
			navigator.clipboard.writeText(fullUrl).then(() => {
				// Notify the user that the text was copied successfully
				flashVisibility(msg);
			});
		} else {
			msg.innerHTML = "No HTTPS ?";
			// Notify the user that the text cannot be copied
			flashVisibility(msg);
		}
	}

	function flashVisibility(el: HTMLElement) {
		el.style.visibility = "visible";
		setTimeout(() => {
			el.style.visibility = "hidden";
			el.innerHTML = COPY_MSG;
		}, 2000);
	}

	let isHolding = false;
	let holdTimeout;

	function handleShareMouseDown() {
		isHolding = true;

		// Start a timer for 1.5 seconds
		holdTimeout = setTimeout(() => {
			if (isHolding) {
				const msg = document.querySelector(".ghost") as HTMLElement;
				msg.innerHTML = "Downloading...";
				flashVisibility(msg);
				window.open(track.src, "_blank");
			}
		}, 1500); // 1500 milliseconds
	}

	function handleShareMouseUp() {
		isHolding = false;
		clearTimeout(holdTimeout); // Clear the timer if the mouse is released
	}

	function handleShareMouseLeave() {
		if (isHolding) {
			isHolding = false;
			clearTimeout(holdTimeout); // Clear the timer if the mouse leaves the div
		}
	}
</script>

<div id="controlsBox" class="absolute inset-0 z-10 flex flex-col">
	<!-- The gates: album + track list overlay -->
	<div class="min-h-0 flex-1 overflow-hidden">
		{#if list}
			<div
				id="list"
				class="flex h-full w-full bg-parchment/90"
				in:fly={{ y: 600, duration: 400 }}
				out:fly={{ y: 600, duration: 300 }}
			>
				<div id="albums" class="w-2/5 max-w-[14rem] shrink-0 overflow-y-auto border-r-[3px] border-black p-2">
					<ul class="m-0 flex list-none flex-col p-0">
						{#each albums as album}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<li
								on:click={() => {
									selected = album;
									stats = false;
								}}
								class="-mt-px flex cursor-pointer items-center gap-2 border border-brand p-1.5 transition-colors hover:text-brand hover:underline {selected ===
									album && !stats
									? 'relative border-[3px] border-black font-bold'
									: ''}"
							>
								<img src={album.src} alt="" class="h-6 w-6 shrink-0" />
								<span class="min-w-0 break-words text-sm">{album.name}</span>
							</li>
						{/each}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<li
							on:click={() => {
								stats = !stats;
							}}
							class="-mt-px flex cursor-pointer items-center gap-2 border border-brand p-1.5 transition-colors hover:text-brand hover:underline {stats
								? 'relative border-[3px] border-black font-bold'
								: ''}"
						>
							<span class="text-sm">Stats</span>
						</li>
					</ul>
				</div>
				<div id="tracklist" class="min-w-0 flex-1 overflow-y-auto px-4 pb-6 text-left">
					{#if stats}
						<div class="mx-auto max-w-prose pt-4 text-sm leading-relaxed">
							<div class="mb-4 border-[3px] border-black bg-white/60 p-3">
								<h3 class="m-0 mb-2 text-base font-bold">the numbers</h3>
								<p class="my-1"><span class="font-bold">{tracks.length}</span> songs on board</p>
								{#if oldest}
									<p class="my-1">
										the oldest: <span class="font-bold">{oldest.track.name}</span>
										<span class="font-mono text-xs text-neutral-500"
											>{oldest.stamp.month} {oldest.stamp.day}, {oldest.stamp.year}</span
										>
									</p>
								{/if}
								{#if releasedToday.length > 0}
									<p class="my-1 font-bold text-brand">
										🎂 released on this day:
										{#each releasedToday as b, i}
											<!-- svelte-ignore a11y-click-events-have-key-events -->
											<span
												class="cursor-pointer underline hover:text-black"
												on:click={() => chooseTrack(b.track.name)}>{b.track.name}</span
											>
											<span class="font-mono text-xs">({b.stamp.month} {b.stamp.day}, {b.stamp.year})</span
											>{i < releasedToday.length - 1 ? "," : ""}
										{/each}
									</p>
								{:else}
									<p class="my-1 text-neutral-600">no songs were released on this day</p>
								{/if}
								{#if upcomingBirthdays.length > 0}
									<p class="my-1 mt-2 font-bold">song birthdays around now:</p>
									<ul class="m-0 list-none p-0">
										{#each upcomingBirthdays as b}
											<li class="my-0.5">
												<!-- svelte-ignore a11y-click-events-have-key-events -->
												<span
													class="cursor-pointer font-bold transition-colors hover:text-brand hover:underline"
													on:click={() => chooseTrack(b.track.name)}>{b.track.name}</span
												>
												— {relLabel(b.diff)}
												<span class="font-mono text-xs text-neutral-500"
													>(released {b.stamp.month} {b.stamp.day}, {b.stamp.year})</span
												>
											</li>
										{/each}
									</ul>
								{/if}
							</div>
							<span class="font-bold">Thanks for listening :)</span>
							<p class="my-2">
								Most songs written and performed by me except for the ones with friends
								<a
									href="https://www.instagram.com/honeydutheband/"
									target="_blank"
									class="text-brand underline hover:text-black">(Cigs Inside is now 𝘩𝘰𝘯𝘦𝘺𝘥ü, check them out here)</a
								>
							</p>
							<p class="my-2">
								<a href="https://www.youtube.com/watch?v=uzTMHcWtP2Q" class="text-brand underline hover:text-black"
									>(Check out The Cut Ties here!)</a
								>
							</p>
							<p class="my-2">
								All tracks recorded and produced by me in dorm rooms, cars, bars, airplanes, or bathrooms (always with
								dogs/cats)
							</p>
							<p class="my-2">Now I make music at my apt in plano TX 😜. I stay quiet most days, meditation and video games</p>
							<p class="my-2">
								Feel free to download and use anything you like (hold the share icon to download). Post it wherever too
								just please credit me
							</p>
						</div>
					{:else}
						<div class="flex items-center gap-3 py-2">
							<img src={selected.src} alt="" class="h-20 w-20 border-[3px] border-black" />
							<h3 class="m-0 text-base font-bold md:text-lg">{selected.name} by {selected.artist}</h3>
						</div>
						<ol class="m-0 flex list-decimal flex-col gap-1 pl-6 pr-1">
							{#each selectedTracks as listTrack (listTrack.src)}
								<li class={track.name === listTrack.name ? "font-bold text-brand" : ""}>
									<div class="flex flex-wrap items-center justify-between gap-x-2.5 gap-y-1">
										<!-- svelte-ignore a11y-click-events-have-key-events -->
										<span
											class="cursor-pointer transition-colors hover:text-brand hover:underline"
											on:click={() => {
												chooseTrack(listTrack.name);
											}}
										>
											{listTrack.name}
										</span>
										{#if hasDetails(listTrack)}
											<!-- svelte-ignore a11y-click-events-have-key-events -->
											<span
												class="cursor-pointer whitespace-nowrap rounded-full border px-2 font-mono text-xs font-normal transition-colors hover:text-white {chipBase(
													listTrack
												)} {chipHover(listTrack)} {expandedStory === listTrack.name ? chipOpen(listTrack) : ''}"
												title="the story behind it"
												on:click={() => toggleStory(listTrack.name)}
											>
												{glanceDate(listTrack.when)}
												<span class="pl-1 font-bold">{expandedStory === listTrack.name ? "−" : "+"}</span>
											</span>
										{:else if listTrack.when}
											<span class="whitespace-nowrap rounded-full border px-2 font-mono text-xs font-normal {chipBase(listTrack)}">
												{glanceDate(listTrack.when)}
											</span>
										{/if}
									</div>
									{#if expandedStory === listTrack.name}
										<div
											class="my-1.5 cursor-default select-text border-l-[3px] border-brand bg-white/60 px-2.5 py-1 text-sm font-normal text-black"
											transition:slide|local={{ duration: 250 }}
										>
											{#if listTrack.when}
												<p class="my-1 font-mono text-xs font-bold text-neutral-500">{fullDate(listTrack.when)}</p>
											{/if}
											{#if listTrack.where}
												<p class="my-1 text-xs text-neutral-600">📍 {listTrack.where}</p>
											{/if}
											{#if listTrack.why}
												<p class="my-1 whitespace-pre-line italic">{listTrack.why}</p>
											{/if}
										</div>
									{/if}
								</li>
							{/each}
						</ol>
					{/if}
				</div>
			</div>
		{/if}
	</div>
	<!-- Bottom bar: art, transport, seek -->
	<div id="seeker" class="flex items-end gap-3 border-t-[3px] border-black p-3">
		<div class="flex shrink-0 flex-col items-center">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="group relative w-fit cursor-pointer" on:click={toggleList}>
				<img src={track.img} alt="album art" class="block h-[90px] w-[90px] border-[3px] border-black" />
				<span
					class="pointer-events-none absolute inset-0 flex items-center justify-center transition-colors group-hover:text-brand {list
						? 'text-brand'
						: 'text-black'}"
				>
					{#if !list}
						<ChevronUpIcon size="40" />
					{:else}
						<ChevronDownIcon size="40" />
					{/if}
				</span>
			</div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<h3
				class="m-0 w-fit cursor-pointer pt-1 text-sm font-bold hover:underline {list ? 'text-brand' : 'text-black'}"
				on:click={toggleList}
			>
				{list ? "ah close em!" : "openthegates"}
			</h3>
		</div>
		<div class="flex min-w-0 flex-1 flex-col items-center">
			<div class="flex flex-col items-center pt-1">
				<span class="flex items-center">
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span
						class="cursor-pointer p-1.5 transition hover:scale-125 hover:text-neutral-500 active:text-brand"
						on:click={() => command("prev")}
					>
						<SkipBackIcon size="40" />
					</span>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span
						class="cursor-pointer p-1.5 transition hover:scale-125 hover:text-neutral-500 active:text-brand"
						on:click={() => command("playPause")}
					>
						{#if isPlaying}
							<PauseIcon size="40" />
						{:else}
							<PlayIcon size="40" />
						{/if}
					</span>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span
						class="cursor-pointer p-1.5 transition hover:scale-125 hover:text-neutral-500 active:text-brand"
						on:click={() => command("next")}
					>
						<SkipForwardIcon size="40" />
					</span>
				</span>
				<span class="flex items-center">
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span
						on:click={() => command("shuffle")}
						class="cursor-pointer p-1.5 transition hover:scale-125 {shuffle
							? 'text-brand'
							: 'hover:text-neutral-500 active:text-brand'}"
					>
						<ShuffleIcon size="25" />
					</span>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span
						on:click={() => command("loop")}
						class="cursor-pointer p-1.5 transition hover:scale-125 {loop
							? 'text-brand'
							: 'hover:text-neutral-500 active:text-brand'}"
					>
						<RepeatIcon size="25" />
					</span>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span
						class="cursor-pointer p-1.5 transition hover:scale-125 hover:text-neutral-500 active:text-brand"
						on:click={shareSong}
						on:mousedown={handleShareMouseDown}
						on:mouseup={handleShareMouseUp}
						on:mouseleave={handleShareMouseLeave}
					>
						<Share2Icon size="25" />
					</span>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span
						on:click={() => window.open(track.src, "_blank")}
						class="cursor-pointer p-1.5 transition hover:scale-125 hover:text-neutral-500 active:text-brand"
					>
						<DownloadIcon size="25" />
					</span>
					<span class="cursor-pointer p-1.5 transition hover:scale-125">
						<a href="https://wearedogs.net" target="_blank">
							<img src="/dogs.webp" alt="Dogs Icon" class="h-[25px] w-[25px]" />
						</a>
					</span>
				</span>
				<span class="ghost invisible text-sm">{COPY_MSG}</span>
			</div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<span class="w-fit cursor-pointer transition-colors hover:text-brand hover:underline" on:click={toggleList}>
				{#if !isMobile}
					{track.artist} -
				{/if}
				{track.name}
			</span>
			<div class="flex w-full items-center gap-2 px-2">
				<span class="text-sm tabular-nums">{_time}</span>
				<div class="min-w-0 flex-1">
					<RangeSlider
						values={[extraTime]}
						min={0}
						max={duration}
						on:start={() => {
							isSeeking = true;
						}}
						on:stop={(e) => {
							command(`seek=${e.detail.value}`);
							isSeeking = false;
						}}
					/>
				</div>
				<span class="text-sm tabular-nums">{_duration}</span>
			</div>
		</div>
	</div>
</div>
