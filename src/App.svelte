<script lang="ts">
	import { onMount } from "svelte";
	import Navbar from "./lib/nav/Navbar.svelte";
	import Music from "./lib/music/Music.svelte";

	let isMobile: boolean = window.innerWidth < 800;

	function onResize() {
		isMobile = window.innerWidth < 800;
	}

	onMount(async () => {
		onResize();
	});
</script>

<svelte:window on:resize={onResize} />
<main class="flex h-[100dvh] flex-col overflow-hidden font-sans">
	<Navbar {isMobile} />
	<article id="music" class="relative min-h-0 flex-1">
		<Music {isMobile} />
	</article>
</main>
