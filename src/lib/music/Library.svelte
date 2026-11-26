<script lang="ts">
	// The gates: a drawer with the crates (every album), the open album's tracklist with
	// the stories behind each song, the stats page, and (dev server only) edit mode.
	// Everything it does goes back to Music.svelte through the "message" event.
	import { createEventDispatcher, tick } from "svelte";
	import { fly, slide } from "svelte/transition";
	import { XIcon, PlayIcon, DownloadIcon } from "svelte-feather-icons";
	import { type Track, type Album, tracks, albums, albumYears, isMixtape } from "./tracks";
	import {
		glanceDate,
		fullDate,
		hasDetails,
		chipBase,
		chipHover,
		chipOpen,
		statTracks,
		oldest,
		releasedToday,
		upcomingBirthdays,
		relLabel,
	} from "./trackMeta";
	import TrackEditor from "./TrackEditor.svelte";
	import { EDITABLE } from "./tracklist-edit";
	import { saved, songKey } from "./offline";

	// Album page for the two mixtapes (stats, playback, credits, feedback): linked from their tracklist headers
	const AYCE_URL = "https://ayce.dogs.red";

	export let track: Track;
	export let isPlaying: boolean;
	export let isMobile: boolean = false;

	const dispatch = createEventDispatcher();

	// Open on the album that's playing, not always the first one
	let selected: Album = albums.find((a) => a.name === track.album) ?? albums[0];
	let stats: boolean = false;
	let expandedStory: string = null;

	$: selectedTracks = tracks.filter((t) => t.album === selected.name);

	// Edit mode (dev server only): reorder, add and delete the open album's tracks, saved into tracks.ts
	let editing: boolean = false;
	let editDirty: boolean = false;

	let cratesEl: HTMLDivElement;
	let listEl: HTMLDivElement;

	/** Leaves edit mode before switching panels; false if there are unsaved edits the user keeps */
	function leaveEdit(): boolean {
		if (editing && editDirty && !confirm("Leave edit mode and throw away these changes?")) return false;
		editing = false;
		return true;
	}

	function pickAlbum(album: Album) {
		if (!leaveEdit()) return;
		selected = album;
		stats = false;
		expandedStory = null;
		if (listEl) listEl.scrollTop = 0;
	}

	function showStats() {
		if (!leaveEdit()) return;
		stats = true;
		if (listEl) listEl.scrollTop = 0;
	}

	function toggleStory(trackName: string) {
		expandedStory = expandedStory === trackName ? null : trackName;
	}

	function chooseTrack(t: Track) {
		// Send the index so duplicate names/srcs (mixtape reissues) pick the exact entry
		dispatch("message", { trackIdx: tracks.indexOf(t) });
	}

	function close() {
		if (!leaveEdit()) return;
		dispatch("message", { cmd: "library" });
	}

	// The crates scroll sideways; let a mouse wheel do that too
	function onCratesWheel(e: WheelEvent) {
		if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
			cratesEl.scrollLeft += e.deltaY;
			e.preventDefault();
		}
	}

	// Bring the playing album into view when the drawer opens
	function revealSelected(node: HTMLElement, isSelected: boolean) {
		if (!isSelected) return;
		// Scroll only the crates row, never the page around it
		tick().then(() => {
			if (cratesEl) cratesEl.scrollLeft = node.offsetLeft - cratesEl.clientWidth / 2 + node.offsetWidth / 2;
		});
	}
</script>

<aside
	class="absolute inset-y-0 right-0 z-30 flex w-full flex-col border-black bg-parchment md:w-[32rem] md:border-l-[3px] md:shadow-[-6px_0_0_rgba(0,0,0,0.15)]"
	transition:fly={{ x: isMobile ? 0 : 520, y: isMobile ? 500 : 0, duration: 260 }}
	aria-label="the gates: albums and tracks"
>
	<!-- Header: what's open + the way out -->
	<header class="flex shrink-0 items-center gap-1 border-b-[3px] border-black bg-white px-2 py-1.5">
		<div class="flex border-[3px] border-black font-mono text-xs font-bold uppercase">
			<button
				type="button"
				class="px-2.5 py-1 {stats ? 'hover:bg-parchment' : 'bg-black text-white'}"
				aria-pressed={!stats}
				on:click={() => pickAlbum(selected)}>crates</button
			>
			<button
				type="button"
				class="border-l-[3px] border-black px-2.5 py-1 {stats ? 'bg-black text-white' : 'hover:bg-parchment'}"
				aria-pressed={stats}
				on:click={showStats}>stats</button
			>
		</div>
		<div class="flex-1" />
		<button
			type="button"
			class="flex items-center gap-1 px-2 py-1 text-sm font-bold text-brand hover:underline"
			title="close  l / esc"
			on:click={close}
		>
			ah close em! <XIcon size="18" />
		</button>
	</header>

	<!-- The crates: every album, sideways -->
	{#if !stats}
		<div
			bind:this={cratesEl}
			on:wheel={onCratesWheel}
			class="relative flex shrink-0 gap-2 overflow-x-auto overscroll-contain border-b-[3px] border-black bg-white/50 px-2 py-2.5"
		>
			{#each albums as album}
				<button
					type="button"
					use:revealSelected={selected === album}
					class="group flex w-[76px] shrink-0 flex-col items-center gap-1 text-center"
					aria-pressed={selected === album}
					title="{album.name} by {album.artist}"
					on:click={() => pickAlbum(album)}
				>
					<span class="relative block">
						<img
							src={album.src}
							alt=""
							loading="lazy"
							class="block h-[64px] w-[64px] border-[3px] object-cover transition-transform group-hover:-translate-y-0.5 {selected ===
							album
								? 'border-black shadow-[3px_3px_0_#e62020]'
								: 'border-transparent group-hover:border-black'}"
						/>
						{#if track.album === album.name}
							<span class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] text-white"
								>♪</span
							>
						{/if}
					</span>
					<span
						class="line-clamp-2 w-full break-words text-[11px] leading-tight {selected === album
							? 'font-bold text-brand'
							: 'group-hover:text-brand'}">{album.name}</span
					>
				</button>
			{/each}
		</div>
	{/if}

	<div id="tracklist" bind:this={listEl} class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-8 text-left md:px-4">
		{#if stats}
			<div class="mx-auto max-w-prose pt-4 text-sm leading-relaxed">
				<div class="mb-4 border-[3px] border-black bg-white p-3 shadow-[4px_4px_0_#000]">
					<h3 class="m-0 mb-2 text-base font-bold">the numbers</h3>
					<p class="my-1"><span class="font-bold">{statTracks.length}</span> songs on board</p>
					{#if oldest}
						<p class="my-1">
							the oldest: <button type="button" class="font-bold hover:text-brand hover:underline" on:click={() => chooseTrack(oldest.track)}
								>{oldest.track.name}</button
							>
							<span class="font-mono text-xs text-neutral-500">{oldest.stamp.month} {oldest.stamp.day}, {oldest.stamp.year}</span>
						</p>
					{/if}
					{#if releasedToday.length > 0}
						<p class="my-1 font-bold text-brand">
							🎂 released on this day:
							{#each releasedToday as b, i}
								<button type="button" class="underline hover:text-black" on:click={() => chooseTrack(b.track)}>{b.track.name}</button>
								<span class="font-mono text-xs">({b.stamp.month} {b.stamp.day}, {b.stamp.year})</span>{i < releasedToday.length - 1
									? ","
									: ""}
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
									<button type="button" class="font-bold transition-colors hover:text-brand hover:underline" on:click={() => chooseTrack(b.track)}
										>{b.track.name}</button
									>
									— {relLabel(b.diff)}
									<span class="font-mono text-xs text-neutral-500">(released {b.stamp.month} {b.stamp.day}, {b.stamp.year})</span>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
				<span class="font-bold">Thanks for listening :)</span>
				<p class="my-2">
					Most songs written and performed by me except for the ones with friends
					<a href="https://www.instagram.com/honeydutheband/" target="_blank" class="text-brand underline hover:text-black"
						>(Cigs Inside is now 𝘩𝘰𝘯𝘦𝘺𝘥ü, check them out here)</a
					>
				</p>
				<p class="my-2">
					<a href="https://www.youtube.com/watch?v=uzTMHcWtP2Q" class="text-brand underline hover:text-black">(Check out The Cut Ties here!)</a>
				</p>
				<p class="my-2">
					All tracks recorded and produced by me in dorm rooms, cars, bars, airplanes, or bathrooms (always with dogs/cats)
				</p>
				<p class="my-2">Now I make music at my apt in plano TX 😜. I stay quiet most days, meditation and video games</p>
				<p class="my-2">
					Feel free to download and use anything you like (hold the share icon to download). Post it wherever too just please
					credit me
				</p>
				<div class="mt-5 border-[3px] border-black bg-white p-3 font-mono text-xs">
					<h3 class="m-0 mb-1.5 font-sans text-sm font-bold">keys</h3>
					<div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
						<span class="font-bold">space</span><span>play / pause</span>
						<span class="font-bold">← →</span><span>prev / next song</span>
						<span class="font-bold">s · r</span><span>shuffle · repeat (off → album → one → ◆ show)</span>
						<span class="font-bold">v</span><span>milkdud ⇄ simple</span>
						<span class="font-bold">[ ] · h</span><span>prev / next milkdud preset · heart it</span>
						<span class="font-bold">l</span><span>openthegates</span>
						<span class="font-bold">f</span><span>fullscreen (or double-tap the visuals)</span>
					</div>
				</div>
				<div class="mt-4 flex items-center gap-3">
					<a href="https://wearedogs.net" target="_blank" class="flex items-center gap-1.5 font-bold hover:text-brand hover:underline">
						<img src="/dogs.webp" alt="" class="h-6 w-6" /> wearedogs.net
					</a>
				</div>
			</div>
		{:else}
			<div class="flex items-start gap-3 pb-3 pt-4">
				<img src={selected.src} alt="" class="h-24 w-24 shrink-0 border-[3px] border-black object-cover shadow-[4px_4px_0_#000]" />
				<div class="flex min-w-0 flex-col items-start gap-1.5">
					<h3 class="m-0 text-lg font-bold leading-tight">
						{selected.name} <span class="font-normal">by {selected.artist}</span>
					</h3>
					<div class="flex flex-wrap items-center gap-1.5">
						{#if albumYears(selected.name)}
							<span class="whitespace-nowrap rounded-full border border-brand px-2 font-mono text-[11px] font-normal leading-5 text-brand"
								>{albumYears(selected.name)}</span
							>
						{/if}
						<span class="whitespace-nowrap font-mono text-[11px] text-neutral-500">{selectedTracks.length} songs</span>
						{#if isMixtape(selected.name)}
							<a
								href={AYCE_URL}
								target="_blank"
								rel="noopener noreferrer"
								class="whitespace-nowrap rounded-full border border-brand bg-brand px-2 font-mono text-[11px] font-bold leading-5 text-black no-underline transition-opacity hover:opacity-80"
								>ALL YOU CAN EAT ↗</a
							>
						{/if}
					</div>
					<div class="flex flex-wrap items-center gap-1.5">
						{#if selectedTracks.length && !editing}
							<button
								type="button"
								class="flex items-center gap-1 border-[3px] border-black bg-black px-2 font-mono text-xs font-bold leading-6 text-white transition-colors hover:bg-brand"
								on:click={() => chooseTrack(selectedTracks[0])}><PlayIcon size="12" /> play it</button
							>
						{/if}
						{#if EDITABLE && !editing}
							<button
								type="button"
								class="border-[3px] border-black px-2 font-mono text-xs font-bold leading-6 transition-colors hover:bg-black hover:text-parchment"
								title="reorder, add and delete tracks (saves into tracks.ts; only on the dev server)"
								on:click={() => (editing = true)}>edit tracks</button
							>
						{/if}
					</div>
				</div>
			</div>
			{#if editing}
				<TrackEditor album={selected.name} bind:dirty={editDirty} on:done={() => (editing = false)} />
			{:else}
				<ol class="m-0 flex list-none flex-col border-t-[3px] border-black p-0">
					{#each selectedTracks as listTrack, i (listTrack.src)}
						{@const playing = track === listTrack}
						<li class="border-b border-black/20 {playing ? 'bg-white/70' : ''}">
							<div class="flex items-center gap-2 py-1.5">
								<!-- Grey number = saved on this device, plays with no signal -->
								<span
									class="w-6 shrink-0 text-right font-mono text-xs {playing
										? 'text-brand'
										: $saved.has(songKey(listTrack.src))
										? 'text-neutral-400'
										: 'text-black'}"
									title={$saved.has(songKey(listTrack.src)) ? "saved on this device" : undefined}
								>
									{#if playing && isPlaying}
										<span class="eq" aria-label="playing"><i /><i /><i /></span>
									{:else}
										{i + 1}
									{/if}
								</span>
								<button
									type="button"
									class="min-w-0 flex-1 text-left transition-colors hover:text-brand hover:underline {playing ? 'font-bold text-brand' : ''}"
									on:click={() => chooseTrack(listTrack)}
								>
									{listTrack.name}
								</button>
								{#if hasDetails(listTrack)}
									<button
										type="button"
										class="shrink-0 whitespace-nowrap rounded-full border px-2 font-mono text-xs font-normal transition-colors hover:text-white {chipBase(
											listTrack
										)} {chipHover(listTrack)} {expandedStory === listTrack.name ? chipOpen(listTrack) : ''}"
										title="the story behind it"
										aria-expanded={expandedStory === listTrack.name}
										on:click={() => toggleStory(listTrack.name)}
									>
										{glanceDate(listTrack.when)}
										<span class="pl-1 font-bold">{expandedStory === listTrack.name ? "−" : "+"}</span>
									</button>
								{:else if listTrack.when}
									<span class="shrink-0 whitespace-nowrap rounded-full border px-2 font-mono text-xs font-normal {chipBase(listTrack)}">
										{glanceDate(listTrack.when)}
									</span>
								{/if}
							</div>
							{#if expandedStory === listTrack.name}
								<div
									class="mb-2 ml-8 cursor-default select-text border-l-[3px] border-brand bg-white/70 px-2.5 py-1 text-sm font-normal text-black"
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
									<a
										href={listTrack.src}
										target="_blank"
										class="my-1 inline-flex items-center gap-1 font-mono text-xs text-brand hover:underline"><DownloadIcon size="12" /> gimme</a
									>
								</div>
							{/if}
						</li>
					{/each}
				</ol>
			{/if}
		{/if}
	</div>
</aside>

<style>
	/* little equalizer next to the playing song */
	.eq {
		display: inline-flex;
		align-items: flex-end;
		gap: 2px;
		height: 12px;
	}
	.eq i {
		display: block;
		width: 3px;
		background: currentColor;
		animation: eq 0.9s ease-in-out infinite;
	}
	.eq i:nth-child(2) {
		animation-delay: -0.3s;
	}
	.eq i:nth-child(3) {
		animation-delay: -0.6s;
	}
	@keyframes eq {
		0%,
		100% {
			height: 3px;
		}
		50% {
			height: 12px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.eq i {
			animation: none;
			height: 8px;
		}
	}
</style>
