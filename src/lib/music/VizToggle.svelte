<script lang="ts">
	// milkdud ⇄ simple: which visualizer is on the stage
	import { createEventDispatcher } from "svelte";

	export let vizMode: "milkdud" | "simple";
	export let canMilkdud: boolean = true;

	const dispatch = createEventDispatcher();

	function choose(mode: "milkdud" | "simple") {
		if (mode !== vizMode) dispatch("message", { cmd: "viz" });
	}
</script>

<div class="flex shrink-0 border-[3px] border-black font-mono text-[11px] font-bold uppercase" role="group" aria-label="visualizer">
	<button
		type="button"
		class="px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40 {vizMode === 'milkdud' ? 'bg-black text-white' : 'hover:bg-parchment'}"
		aria-pressed={vizMode === "milkdud"}
		disabled={!canMilkdud}
		title={canMilkdud ? "milkdud: MilkDrop presets  v" : "milkdud needs WebGL 2, this browser doesn't have it"}
		on:click={() => choose("milkdud")}>milkdud</button
	>
	<button
		type="button"
		class="border-l-[3px] border-black px-2 py-1 {vizMode === 'simple' ? 'bg-black text-white' : 'hover:bg-parchment'}"
		aria-pressed={vizMode === "simple"}
		title="the simple view  v"
		on:click={() => choose("simple")}>simple</button
	>
</div>
