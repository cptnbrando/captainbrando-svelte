<script lang="ts">
	import Emu from "./Emu.svelte";

	export let isMobile: boolean = false;

	// Go to the root index \captainbrando-svelte\index.html to change what you need to change for games
</script>

<div class="container" id="emuPanel">
	<!-- {#if !isMobile} -->
	<div class="emu-flex over" id="emuOver">
		<h3>Game Time</h3>
		<span>
			<button
				on:click={() => {
					window.location.reload();
				}}>click to reload</button
			>
		</span>
		<br />
		<br />
		<span>Click this button ☝️ if you don't see anything</span>
		<br />
		<span>Then click the [Start Game] button at the top</span>
		<br />
		<span>After it loads, click the blinking pause symbol at the top ⏸️</span>
		<br />
		<span>bada bing bada boom!</span>
	</div>
	<div class="emu-flex" id="emuMain">
		<Emu />
	</div>
	<div class="emu-flex over" id="emuControls">
		<h3>Controls</h3>
		<span>Arrow Keys to move</span>
		<br />
		<span>Z to do something</span>
		<span>X to do something else</span>
		<span>C to do more</span>
		<span>D to do less (crouch)</span>
	</div>
	<!-- {:else}
    <div class="emu-flex" id="emuMain">
        <h1>No games on mobile for now...</h1>
    </div>
    {/if} -->
</div>

<style lang="scss">
	.container {
		display: flex;
		text-align: center;
		justify-content: center;
		align-items: center;
		width: 100%;

		height: 100%;
		margin-top: 3rem;
	}

	.emu-flex {
		flex: 1;
	}

	#emuMain {
		flex: 5;
	}

	.over {
		align-self: flex-start;
		padding: 2%;
	}

	span {
		display: flex;
		flex-direction: column;
		width: 100%;
		align-items: center;
		justify-content: center;
	}

	button {
		margin-left: 6px;
		--c: #229091; /* the color*/

		box-shadow: 0 0 0 0.1em inset var(--c);
		--_g: linear-gradient(var(--c) 0 0) no-repeat;
		background: var(--_g) calc(var(--_p, 0%) - 100%) 0%, var(--_g) calc(200% - var(--_p, 0%)) 0%,
			var(--_g) calc(var(--_p, 0%) - 100%) 100%, var(--_g) calc(200% - var(--_p, 0%)) 100%;
		background-size: 50.5% calc(var(--_p, 0%) / 2 + 0.5%);
		outline-offset: 0.1em;
		transition: background-size 0.4s, background-position 0s 0.4s;

		cursor: pointer;
		padding: 0.1em 0.6em;
		font-weight: bold;
		border: none;

		&:hover {
			--_p: 100%;
			transition: background-position 0.4s, background-size 0s;
		}

		&:active {
			box-shadow: 0 0 9e9Q inset #0009;
			background-color: var(--c);
			color: #fff;
		}
	}
</style>
