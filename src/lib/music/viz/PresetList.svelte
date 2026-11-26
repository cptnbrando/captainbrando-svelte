<script lang="ts">
	// Every milkdud preset with a search box and a heart on each. "hearts" narrows
	// it to the listener's own list. Tapping a name puts that preset on screen.
	import { HeartIcon, SearchIcon } from "svelte-feather-icons";
	import { names, current, favorites, toggleFavorite, pick } from "./presetDeck";

	/** How many matches the list draws at once: enough to browse, cheap to draw */
	const MAX_LISTED = 120;

	let query = "";
	let heartsOnly = false;

	$: pool = heartsOnly ? $favorites : $names;
	$: words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
	$: matches = words.length ? pool.filter((n) => words.every((w) => n.toLowerCase().includes(w))) : pool;
	$: listed = matches.slice(0, MAX_LISTED);
	$: emptyNote =
		heartsOnly && !$favorites.length
			? "no hearts yet. tap the heart on a preset you love."
			: !$names.length
			? "presets show up once the music starts. press play."
			: "nothing matches that.";
</script>

<div class="flex min-h-0 flex-1 flex-col">
	<div class="flex items-center gap-2 border-b-[3px] border-black px-2 py-1.5">
		<SearchIcon size="14" class="shrink-0" />
		<input
			bind:value={query}
			type="search"
			placeholder="search {pool.length} presets"
			aria-label="search milkdud presets"
			autocomplete="off"
			spellcheck="false"
			class="w-full min-w-0 bg-transparent font-mono text-xs outline-none placeholder:text-neutral-400"
		/>
		<div class="flex shrink-0 border-2 border-black font-mono text-[10px] font-bold uppercase" role="group">
			<button
				type="button"
				class="px-2 py-0.5 {heartsOnly ? '' : 'bg-black text-white'}"
				aria-pressed={!heartsOnly}
				on:click={() => (heartsOnly = false)}>all</button
			>
			<button
				type="button"
				class="flex items-center gap-1 px-2 py-0.5 {heartsOnly ? 'bg-black text-white' : ''}"
				aria-pressed={heartsOnly}
				on:click={() => (heartsOnly = true)}><HeartIcon size="10" /> {$favorites.length}</button
			>
		</div>
	</div>
	<ul class="m-0 min-h-0 flex-1 list-none overflow-y-auto overscroll-contain p-0 py-1">
		{#each listed as name (name)}
			<li class="flex items-center">
				<button
					type="button"
					class="min-w-0 flex-1 truncate px-2.5 py-1.5 text-left font-mono text-[11px] hover:bg-black hover:text-white {name ===
					$current
						? 'font-bold text-brand'
						: ''}"
					aria-current={name === $current ? "true" : undefined}
					on:click={() => pick(name)}>{name}</button
				>
				<button
					type="button"
					class="flex h-7 w-9 shrink-0 items-center justify-center hover:text-brand {$favorites.includes(name)
						? 'text-brand'
						: 'text-neutral-400'}"
					aria-pressed={$favorites.includes(name)}
					aria-label={$favorites.includes(name) ? `take the heart off ${name}` : `heart ${name}`}
					on:click={() => toggleFavorite(name)}
				>
					<HeartIcon size="13" class={$favorites.includes(name) ? "fill-current" : ""} />
				</button>
			</li>
		{/each}
		{#if !listed.length}
			<li class="px-2.5 py-3 font-mono text-[11px] text-neutral-500">{emptyNote}</li>
		{:else if matches.length > listed.length}
			<li class="px-2.5 py-2 font-mono text-[10px] text-neutral-500">
				{matches.length - listed.length} more. search to narrow it down.
			</li>
		{/if}
	</ul>
</div>
