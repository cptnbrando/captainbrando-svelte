<script lang="ts">
	// The milkdud deck: prev / next preset, what's on (tap it for the list), a heart
	// to keep it, hearts-only, shuffle, and the 30s auto-advance stopwatch.
	// It only asks; presetDeck and its engine do the work.
	import { ChevronLeftIcon, ChevronRightIcon, HeartIcon, ShuffleIcon, ListIcon } from "svelte-feather-icons";
	import { fly } from "svelte/transition";
	import { AUTO_ADVANCE_MS } from "./MilkdropEngine";
	import {
		current,
		favorites,
		favoritesOnly,
		shuffle,
		auto,
		names,
		toggleFavorite,
		setFavoritesOnly,
		setShuffle,
		setAuto,
		next,
		previous,
	} from "./presetDeck";
	import PresetList from "./PresetList.svelte";

	const AUTO_SECONDS = AUTO_ADVANCE_MS / 1000;

	export let listOpen: boolean = false;

	$: hearted = $favorites.includes($current);
</script>

<div class="flex w-full flex-col gap-2 sm:w-[26rem]">
	<div class="flex items-center border-[3px] border-black bg-white shadow-[4px_4px_0_#000]">
		<button type="button" class="deck-btn" on:click={previous} aria-label="previous preset" title="previous preset  [">
			<ChevronLeftIcon size="18" />
		</button>
		<button type="button" class="deck-btn" on:click={next} aria-label="next preset" title="next preset  ]">
			<ChevronRightIcon size="18" />
		</button>
		<button
			type="button"
			class="min-w-0 flex-1 self-stretch truncate border-x-[3px] border-black px-2 text-left font-mono text-[11px] font-bold uppercase tracking-wide hover:bg-black hover:text-white {listOpen
				? 'bg-black text-white'
				: ''}"
			aria-expanded={listOpen}
			title={listOpen ? "hide the presets" : `browse ${$names.length} presets`}
			on:click={() => (listOpen = !listOpen)}
		>
			{$current || "warming up the milkdud…"}
		</button>
		<button
			type="button"
			class="deck-btn {hearted ? 'text-brand' : ''}"
			aria-pressed={hearted}
			aria-label={hearted ? "take the heart off this preset" : "heart this preset"}
			title={hearted ? "in your hearts. tap to take it out  h" : "heart this preset  h"}
			on:click={() => toggleFavorite()}
		>
			<HeartIcon size="16" class={hearted ? "fill-current" : ""} />
		</button>
		<button
			type="button"
			class="deck-btn {$favoritesOnly ? 'text-brand' : ''}"
			aria-pressed={$favoritesOnly}
			aria-label="play only my hearted presets"
			title={$favoritesOnly ? "playing only your hearts" : "play only your hearts"}
			on:click={() => setFavoritesOnly(!$favoritesOnly)}
		>
			<ListIcon size="16" />
		</button>
		<button
			type="button"
			class="deck-btn {$shuffle ? 'text-brand' : ''}"
			aria-pressed={$shuffle}
			aria-label="shuffle presets"
			title={$shuffle ? "preset shuffle: on" : "preset shuffle: off, they go in order"}
			on:click={() => setShuffle(!$shuffle)}
		>
			<ShuffleIcon size="16" />
		</button>
		<button
			type="button"
			class="deck-btn {$auto ? 'text-brand' : ''}"
			aria-pressed={$auto}
			aria-label="new preset every {AUTO_SECONDS} seconds"
			title={$auto ? `a new preset every ${AUTO_SECONDS}s: on` : `a new preset every ${AUTO_SECONDS}s: off`}
			on:click={() => setAuto(!$auto)}
		>
			<!-- A stopwatch whose hand goes once round while a preset plays; each new preset starts it over -->
			{#key $current}
				<svg
					class="timer"
					class:running={$auto}
					style="--auto-ms: {AUTO_ADVANCE_MS}ms"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					aria-hidden="true"
				>
					<line x1="10" x2="14" y1="2" y2="2" />
					<circle cx="12" cy="14" r="8" />
					<line class="hand" x1="12" y1="14" x2="12" y2="8.5" />
				</svg>
			{/key}
		</button>
	</div>

	{#if listOpen}
		<div
			class="flex max-h-[50vh] flex-col overflow-hidden border-[3px] border-black bg-white shadow-[4px_4px_0_#000]"
			transition:fly={{ y: -10, duration: 150 }}
		>
			<PresetList />
		</div>
	{/if}
</div>

<style>
	.deck-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 34px;
		height: 34px;
		transition: background 0.1s, color 0.1s;
	}
	.deck-btn:hover,
	.deck-btn:focus-visible {
		background: black;
		color: white;
	}
	.deck-btn:active {
		transform: scale(0.9);
	}
	.hand {
		transform-box: view-box;
		transform-origin: 12px 14px;
	}
	.running .hand {
		animation: sweep var(--auto-ms) linear forwards;
	}
	@keyframes sweep {
		to {
			transform: rotate(360deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.running .hand {
			animation: none;
		}
	}
</style>
