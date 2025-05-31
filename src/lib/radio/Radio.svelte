<script lang="ts">
	import { HeadphonesIcon } from "svelte-feather-icons";
	import SpotifyChecker from "./SpotifyChecker.svelte";

	let pushed: boolean = false;
</script>

<div>
	<h1>📻</h1>
	{#if pushed}
		<h6>hey, gimme some time man! come back later plz :)</h6>
	{:else}
		<h6>gotta code spotify api stuff...brb!</h6>
	{/if}
	<button
		class="spotifyButton"
		on:click={() => {
			pushed = true;
		}}
	>
		<HeadphonesIcon />
		Login with Spotify
	</button>
	<SpotifyChecker />
</div>

<style>
	div {
		display: flex;
		width: 100%;
		height: 100%;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}

	.spotifyButton {
		background-color: #44c767;
		border-radius: 28px;
		border: 1px solid #18ab29;
		display: inline-block;
		cursor: pointer;
		color: #ffffff;
		font-size: 17px;
		padding: 16px 31px;
		text-decoration: none;
		text-shadow: 0px 1px 0px #2f6627;

		&:hover {
			background-color: #5cbf2a;
		}

		&:active {
			position: relative;
			top: 1px;
		}
	}
</style>
