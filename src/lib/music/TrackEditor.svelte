<script lang="ts">
	// The tracklist in edit mode: drag the ⠿ handle (mouse or touch) or focus it and use the arrow
	// keys to reorder, × to delete (undo until you save), the form to add. Save writes tracks.ts.
	import { createEventDispatcher, onDestroy } from "svelte";
	import { flip } from "svelte/animate";
	import { slide } from "svelte/transition";
	import { albumRows, moveRow, saveAlbum, stampFromLocal, localNow, type Row } from "./tracklist-edit";

	const FLIP_MS = 160;
	const EDGE_PX = 48; // dragging this close to the top or bottom of the list scrolls it
	const SCROLL_STEP = 14;

	export let album: string;
	/** True once anything changed, so the album list can warn before throwing edits away */
	export let dirty: boolean = false;

	const dispatch = createEventDispatcher();
	const original = albumRows(album);
	let rows: Row[] = original.slice();
	let removed: Row[] = [];
	let nextKey = -1; // new rows get negative keys, existing ones their index in `tracks`

	let listEl: HTMLOListElement;
	let dragKey: number | null = null;
	let scrollTimer: ReturnType<typeof setInterval> | null = null;
	let lastY = 0;

	let saving = false;
	let error = "";

	let adding = false;
	let form = { name: "", src: "", when: localNow(), where: "", why: "" };

	$: dirty = removed.length > 0 || rows.length !== original.length || rows.some((r, k) => r.key !== original[k].key);

	/** The scrolling box around the list (#tracklist in Controls) */
	function scroller(): HTMLElement | null {
		return listEl?.closest("#tracklist") as HTMLElement | null;
	}

	/** Index the dragged row belongs at for pointer height y, from layout positions (not the flip transforms) */
	function targetIndex(y: number): number {
		const top = listEl.getBoundingClientRect().top;
		const items = Array.from(listEl.children) as HTMLElement[];
		let index = 0;
		items.forEach((el, k) => {
			if (rows[k]?.key === dragKey) return;
			if (y - top > el.offsetTop + el.offsetHeight / 2) index++;
		});
		return index;
	}

	function dragTo(y: number) {
		lastY = y;
		const from = rows.findIndex((r) => r.key === dragKey);
		rows = moveRow(rows, from, targetIndex(y));
	}

	function startDrag(e: PointerEvent, key: number) {
		if (e.button !== 0) return;
		e.preventDefault();
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		dragKey = key;
		lastY = e.clientY;
		scrollTimer = setInterval(autoScroll, 16);
	}

	function onDragMove(e: PointerEvent) {
		if (dragKey === null) return;
		dragTo(e.clientY);
	}

	function endDrag() {
		dragKey = null;
		if (scrollTimer) clearInterval(scrollTimer);
		scrollTimer = null;
	}

	/** While dragging near an edge of the list, keep scrolling and keep the row under the pointer */
	function autoScroll() {
		const box = scroller();
		if (!box || dragKey === null) return;
		const rect = box.getBoundingClientRect();
		const step = lastY < rect.top + EDGE_PX ? -SCROLL_STEP : lastY > rect.bottom - EDGE_PX ? SCROLL_STEP : 0;
		if (!step) return;
		box.scrollTop += step;
		dragTo(lastY);
	}

	/** Arrow keys on a focused handle move its row; Home/End jump to the ends */
	function onHandleKey(e: KeyboardEvent, k: number) {
		const to = { ArrowUp: k - 1, ArrowDown: k + 1, Home: 0, End: rows.length - 1 }[e.key];
		if (to === undefined) return;
		e.preventDefault();
		e.stopPropagation(); // the player's own arrow-key shortcuts skip tracks
		rows = moveRow(rows, k, to);
		// Keep focus on the moved row's handle after Svelte re-renders the list
		requestAnimationFrame(() => (listEl.children[Math.max(0, Math.min(rows.length - 1, to))]?.querySelector("button") as HTMLElement)?.focus());
	}

	/** Where each deleted row sat when it was deleted, so undo puts it back in the same spot */
	const removedAt = new Map<number, number>();

	function remove(row: Row) {
		removedAt.set(row.key, rows.findIndex((r) => r.key === row.key));
		rows = rows.filter((r) => r.key !== row.key);
		if (!row.add) removed = [...removed, row];
	}

	function undoRemove(row: Row) {
		removed = removed.filter((r) => r.key !== row.key);
		const at = Math.min(removedAt.get(row.key) ?? rows.length, rows.length);
		rows = [...rows.slice(0, at), row, ...rows.slice(at)];
	}

	function addTrack() {
		const name = form.name.trim();
		const src = form.src.trim();
		if (!name || !src) {
			error = "a new track needs a name and a file";
			return;
		}
		const add = { name, src, when: stampFromLocal(form.when), where: form.where.trim(), why: form.why.trim() };
		rows = [{ key: nextKey--, name, add }, ...rows];
		form = { name: "", src: "", when: localNow(), where: "", why: "" };
		adding = false;
		error = "";
	}

	async function save() {
		saving = true;
		error = "";
		try {
			await saveAlbum(album, rows);
			dirty = false;
			dispatch("done", { saved: true }); // Vite sees tracks.ts change and reloads the player
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			saving = false;
		}
	}

	function cancel() {
		if (dirty && !confirm("Throw away these changes?")) return;
		dirty = false;
		dispatch("done", { saved: false });
	}

	onDestroy(endDrag);
</script>

<!-- Keys typed or pressed in the editor stay here, so the player's space/arrow shortcuts don't fire -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="pb-4" on:keydown|stopPropagation>
	<div class="sticky top-0 z-10 -mx-4 mb-2 flex flex-wrap items-center gap-2 border-b-[3px] border-black bg-parchment px-4 py-2">
		<span class="font-mono text-xs font-bold uppercase tracking-wider text-brand">edit mode</span>
		<span class="text-xs text-neutral-600">drag ⠿ or arrow keys to reorder · × to delete</span>
		<span class="ml-auto flex min-w-0 flex-wrap justify-end gap-2">
			<button
				type="button"
				class="border-[3px] border-black px-2 py-0.5 text-sm font-bold transition-colors hover:bg-black hover:text-parchment"
				on:click={() => (adding = !adding)}>{adding ? "close form" : "+ add track"}</button
			>
			<button
				type="button"
				class="border-[3px] border-black px-2 py-0.5 text-sm transition-colors hover:bg-black hover:text-parchment"
				on:click={cancel}>cancel</button
			>
			<button
				type="button"
				class="border-[3px] border-black bg-brand px-2 py-0.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-40"
				disabled={!dirty || saving}
				on:click={save}>{saving ? "saving…" : "save to tracks.ts"}</button
			>
		</span>
		{#if error}
			<p class="m-0 w-full text-sm font-bold text-brand" role="alert">{error}</p>
		{/if}
	</div>

	{#if adding}
		<form class="mb-3 grid gap-2 border-[3px] border-black bg-white/60 p-3 text-sm" on:submit|preventDefault={addTrack} transition:slide|local={{ duration: 200 }}>
			<label class="grid gap-0.5">
				<span class="font-mono text-xs text-neutral-600">name</span>
				<input class="border border-black bg-white px-2 py-1" bind:value={form.name} placeholder="waddle by club penguin" required />
			</label>
			<label class="grid gap-0.5">
				<span class="font-mono text-xs text-neutral-600">file (full URL, or a path like 2026/waddle)</span>
				<input class="border border-black bg-white px-2 py-1 font-mono" bind:value={form.src} placeholder="https://data.wearedogs.net/music/2026/waddle.mp3" required />
			</label>
			<label class="grid gap-0.5">
				<span class="font-mono text-xs text-neutral-600">when</span>
				<input class="border border-black bg-white px-2 py-1 font-mono" type="datetime-local" bind:value={form.when} />
			</label>
			<label class="grid gap-0.5">
				<span class="font-mono text-xs text-neutral-600">where (optional)</span>
				<input class="border border-black bg-white px-2 py-1" bind:value={form.where} />
			</label>
			<label class="grid gap-0.5">
				<span class="font-mono text-xs text-neutral-600">why (optional)</span>
				<textarea class="border border-black bg-white px-2 py-1" rows="2" bind:value={form.why} />
			</label>
			<button type="submit" class="w-fit border-[3px] border-black px-3 py-0.5 font-bold transition-colors hover:bg-black hover:text-parchment"
				>add to {album}</button
			>
		</form>
	{/if}

	<ol bind:this={listEl} class="relative m-0 flex list-none flex-col gap-1 p-0">
		{#each rows as row, k (row.key)}
			<li
				animate:flip={{ duration: dragKey === row.key ? 0 : FLIP_MS }}
				class="flex items-center gap-2 border border-black/30 bg-white/50 py-1 pl-1 pr-2 {dragKey === row.key
					? 'relative z-10 border-black bg-white shadow-[4px_4px_0_0_#000]'
					: ''}"
			>
				<button
					type="button"
					class="cursor-grab touch-none select-none px-1.5 text-lg leading-none text-neutral-500 hover:text-black focus:text-brand focus:outline-none active:cursor-grabbing"
					aria-label="Move {row.name}. Arrow keys move it up or down."
					title="drag, or arrow keys"
					on:pointerdown={(e) => startDrag(e, row.key)}
					on:pointermove={onDragMove}
					on:pointerup={endDrag}
					on:pointercancel={endDrag}
					on:keydown={(e) => onHandleKey(e, k)}>⠿</button
				>
				<span class="w-6 shrink-0 text-right font-mono text-xs text-neutral-500">{k + 1}</span>
				<span class="min-w-0 flex-1 break-words">{row.name}</span>
				{#if row.add}
					<span class="whitespace-nowrap rounded-full border border-brand px-2 font-mono text-[11px] text-brand">new</span>
				{/if}
				<button
					type="button"
					class="px-1 text-lg leading-none text-neutral-500 transition-colors hover:text-brand focus:text-brand focus:outline-none"
					aria-label="Delete {row.name}"
					title="delete"
					on:click={() => remove(row)}>×</button
				>
			</li>
		{/each}
	</ol>

	{#if removed.length}
		<div class="mt-3 border-l-[3px] border-brand pl-2 text-sm" transition:slide|local={{ duration: 200 }}>
			<p class="m-0 mb-1 font-mono text-xs text-neutral-600">deleted on save:</p>
			{#each removed as row (row.key)}
				<p class="my-0.5">
					<span class="line-through">{row.name}</span>
					<button type="button" class="ml-2 text-xs text-brand underline hover:text-black" on:click={() => undoRemove(row)}>undo</button>
				</p>
			{/each}
		</div>
	{/if}
</div>
