<script lang="ts">
	// The dock under the visuals: seek, what's playing, transport, and the extras
	// (milkdud ⇄ simple, share / hold-to-download, gimme, fullscreen, the gates).
	// Every button just sends a command up to Music.svelte.
	import { createEventDispatcher } from "svelte";
	import { fade } from "svelte/transition";
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
		MaximizeIcon,
		MinimizeIcon,
	} from "svelte-feather-icons";
	import type { Track } from "./tracks";
	import VizToggle from "./VizToggle.svelte";
	import ShareButton from "./ShareButton.svelte";
	import { formatTime } from "./trackMeta";


	export let track: Track;
	export let isPlaying: boolean;
	// Network trouble, shown under the song name ("waiting for connection…" etc.)
	export let status: string = "";
	export let time: number = 0;
	export let duration: number = 0;
	export let shuffle: boolean;
	// 0 = off, 1 = repeat album, 2 = repeat one, 3 = ◆ show performance mode (stop when the song ends)
	export let repeatMode: number;
	export let vizMode: "milkdud" | "simple";
	export let canMilkdud: boolean = true;
	export let libraryOpen: boolean = false;
	export let fullscreen: boolean = false;
	export let isMobile: boolean = false;

	const dispatch = createEventDispatcher();
	const command = (cmd: string) => dispatch("message", { cmd });

	// --- Seek: the slider shows where you're dragging, and seeks when you let go ---
	let seeking = false;
	let seekValue = 0;
	$: if (!seeking) seekValue = time || 0;
	$: progress = duration ? Math.min(100, (seekValue / duration) * 100) : 0;

	function onSeekInput(e: Event) {
		seeking = true;
		seekValue = parseFloat((e.target as HTMLInputElement).value);
	}

	function onSeekChange(e: Event) {
		command(`seek=${(e.target as HTMLInputElement).value}`);
		seeking = false;
	}

	$: repeatTitle =
		repeatMode === 1
			? "repeat: album"
			: repeatMode === 2
			? "repeat: one"
			: repeatMode === 3
			? "show performance mode: stop when the song ends"
			: "repeat: off";

	// The little "copied to clip🛹!" note over the bar
	let toast = "";
	let toastTimer: ReturnType<typeof setTimeout>;

	function flash(msg: string) {
		toast = msg;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => (toast = ""), 2000);
	}

</script>

<div class="relative shrink-0 border-t-[3px] border-black bg-white">
	{#if toast}
		<span
			class="pointer-events-none absolute -top-11 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap border-[3px] border-black bg-white px-3 py-1 text-sm font-bold shadow-[3px_3px_0_#000]"
			transition:fade={{ duration: 150 }}>{toast}</span
		>
	{/if}

	<!-- Seek -->
	<div class="flex items-center gap-2 px-3 pt-2 font-mono text-xs tabular-nums">
		<span class="w-10 text-right">{formatTime(seekValue)}</span>
		<input
			type="range"
			class="seek min-w-0 flex-1"
			style="--progress: {progress}%"
			min="0"
			max={duration || 0}
			step="any"
			value={seekValue}
			aria-label="seek"
			on:input={onSeekInput}
			on:change={onSeekChange}
		/>
		<span class="w-10">{formatTime(duration)}</span>
	</div>

	<div class="grid items-center gap-x-3 gap-y-1 px-3 pb-2 pt-1 {isMobile ? 'grid-cols-1' : 'grid-cols-[1fr_auto_1fr]'}">
		<!-- Now playing: tap the art or the name to openthegates -->
		<div class="flex min-w-0 items-center gap-2.5">
			<button
				type="button"
				class="group relative shrink-0"
				title={libraryOpen ? "ah close em!" : "openthegates"}
				aria-expanded={libraryOpen}
				on:click={() => command("library")}
			>
				<img src={track.img} alt="album art" class="block h-14 w-14 border-[3px] border-black object-cover" />
				<span
					class="absolute inset-0 flex items-center justify-center bg-white/0 transition-colors group-hover:bg-white/60 {libraryOpen
						? 'bg-white/60 text-brand'
						: 'text-transparent group-hover:text-black'}"
				>
					{#if libraryOpen}<ChevronDownIcon size="30" />{:else}<ChevronUpIcon size="30" />{/if}
				</span>
			</button>
			<button type="button" class="min-w-0 flex-1 text-left leading-tight" on:click={() => command("library")}>
				<span class="block truncate font-bold hover:text-brand hover:underline">{track.name}</span>
				{#if status}
					<span id="playerStatus" class="block truncate text-xs italic text-brand">{status}</span>
				{:else}
					<span class="block truncate text-xs text-neutral-600">{track.artist} · {track.album}</span>
				{/if}
			</button>
			{#if isMobile}
				<VizToggle {vizMode} {canMilkdud} on:message />
			{/if}
		</div>

		<!-- Transport -->
		<div class="flex items-center justify-center gap-0.5">
			<button
				type="button"
				class="btn {shuffle ? 'text-brand' : ''}"
				aria-pressed={shuffle}
				title={shuffle ? "shuffle: on  s" : "shuffle: off  s"}
				on:click={() => command("shuffle")}
			>
				<ShuffleIcon size="20" />
			</button>
			<button type="button" class="btn" title="previous  ←" on:click={() => command("prev")}>
				<SkipBackIcon size="26" />
			</button>
			<button
				type="button"
				class="mx-1 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-black bg-black text-white shadow-[3px_3px_0_#e62020] transition hover:bg-brand active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
				title={isPlaying ? "pause  space" : "play  space"}
				aria-label={isPlaying ? "pause" : "play"}
				on:click={() => command("playPause")}
			>
				{#if isPlaying}<PauseIcon size="26" />{:else}<span class="pl-1"><PlayIcon size="26" /></span>{/if}
			</button>
			<button type="button" class="btn" title="next  →" on:click={() => command("next")}>
				<SkipForwardIcon size="26" />
			</button>
			<button type="button" class="btn {repeatMode > 0 ? 'text-brand' : ''}" title="{repeatTitle}  r" on:click={() => command("loop")}>
				{#if repeatMode === 3}
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"><path d="M12 2.5 21.5 12 12 21.5 2.5 12z" /></svg
					>
				{:else}
					<span class="relative flex">
						<RepeatIcon size="20" />
						{#if repeatMode === 2}
							<span class="absolute inset-0 flex items-center justify-center text-[10px] font-bold leading-none">1</span>
						{/if}
					</span>
				{/if}
			</button>
			{#if isMobile}
				<ShareButton {track} on:flash={(e) => flash(e.detail)} />
				<button type="button" class="btn" title={fullscreen ? "exit fullscreen" : "fullscreen"} on:click={() => command("fullscreen")}>
					{#if fullscreen}<MinimizeIcon size="20" />{:else}<MaximizeIcon size="20" />{/if}
				</button>
			{/if}
		</div>

		<!-- Extras -->
		{#if !isMobile}
			<div class="flex items-center justify-end gap-0.5">
			<VizToggle {vizMode} {canMilkdud} on:message />
			<ShareButton {track} on:flash={(e) => flash(e.detail)} />
			<button type="button" class="btn" title="gimme (download this song)" on:click={() => command("download")}>
				<DownloadIcon size="20" />
			</button>
			<button type="button" class="btn" title={fullscreen ? "exit fullscreen  f" : "fullscreen  f"} on:click={() => command("fullscreen")}>
				{#if fullscreen}<MinimizeIcon size="20" />{:else}<MaximizeIcon size="20" />{/if}
			</button>
			<a href="https://wearedogs.net" target="_blank" class="btn" title="wearedogs.net">
					<img src="/dogs.webp" alt="Dogs Icon" class="h-[22px] w-[22px]" />
				</a>
				<button
					type="button"
					class="ml-1 flex items-center gap-1 border-[3px] border-black px-2 py-1 text-sm font-bold transition-colors {libraryOpen
						? 'bg-brand text-white'
						: 'hover:bg-black hover:text-white'}"
					title={libraryOpen ? "ah close em!  l" : "openthegates  l"}
					on:click={() => command("library")}
				>
					{libraryOpen ? "ah close em!" : "openthegates"}
					{#if libraryOpen}<ChevronDownIcon size="16" />{:else}<ChevronUpIcon size="16" />{/if}
				</button>
		</div>
		{/if}
	</div>
</div>

<style>
	.btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		flex-shrink: 0;
		transition: transform 0.1s, color 0.1s;
	}
	.btn:hover {
		transform: scale(1.15);
		color: #737373;
	}
	.btn:active {
		color: #e62020;
		transform: scale(0.95);
	}

	/* The seek bar: a thick black track that fills red, with a square thumb */
	.seek {
		-webkit-appearance: none;
		appearance: none;
		height: 22px;
		background: transparent;
		cursor: pointer;
	}
	.seek::-webkit-slider-runnable-track {
		height: 8px;
		border: 2px solid black;
		background: linear-gradient(to right, #e62020 var(--progress), white var(--progress));
	}
	.seek::-moz-range-track {
		height: 4px;
		border: 2px solid black;
		background: linear-gradient(to right, #e62020 var(--progress), white var(--progress));
	}
	.seek::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 16px;
		height: 16px;
		margin-top: -6px;
		background: black;
		border: 2px solid white;
		outline: 2px solid black;
	}
	.seek::-moz-range-thumb {
		width: 12px;
		height: 12px;
		border-radius: 0;
		background: black;
		border: 2px solid white;
		outline: 2px solid black;
	}
	.seek:focus-visible {
		outline: 2px dashed #e62020;
		outline-offset: 2px;
	}
</style>
