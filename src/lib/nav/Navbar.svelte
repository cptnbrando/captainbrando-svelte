<script lang="ts">
	import Typed from "./Typed.svelte";

	export let isMobile: boolean = false;
</script>

<nav class="relative z-50 flex h-16 shrink-0 items-center overflow-hidden border-b-[3px] border-black bg-white px-3">
	<Typed {isMobile} />
</nav>
