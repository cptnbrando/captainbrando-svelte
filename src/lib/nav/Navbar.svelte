<script lang="ts">
	import Typed from './Typed.svelte';
	import { MusicIcon, MailIcon, MenuIcon, DribbbleIcon, RadioIcon, BookIcon } from 'svelte-feather-icons';
	import { fly, fade } from 'svelte/transition';

	export let isMobile: boolean = false;
	export let navHeight: any = 60;
	let show: boolean = false;
	let size: string = "2x";
</script>

<nav class="sticky" on:mouseenter={() => {if(!isMobile) show = true}} on:mouseleave={() => {if(!isMobile) show = false}} style="height: {navHeight}px;">
	<span>
		{#if show}
		<ul in:fly="{{ x: -600, duration: 400, delay: 200 }}" out:fly="{{ x: -600, duration: 400 }}" class="buttons">
			<li>
				<a href="#music">
					<MusicIcon {size} />
					{#if !isMobile}
					<h4>Music</h4>
					{/if}
				</a>
			</li>
			<li>
				<a href="#games">
					<DribbbleIcon {size} />
					{#if !isMobile}
					<h4>Games</h4>
					{/if}
				</a>
			</li>
		</ul>
		{:else}
		<span class="navBox">
			<div id="typer" in:fade="{{ duration: 200, delay: 400 }}" out:fly="{{ x: -400, duration: 200 }}">
				<Typed {isMobile} />
			</div>
		</span>
		{/if}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div on:click={() => show = !show} id="menuButt">
			<MenuIcon size="2x" />
		</div>
	</span>
</nav>

<style lang="scss">
	.sticky {
		background-color: #ffffff;
		position: -webkit-sticky;
		position: sticky;
		top: 0;
	}

	nav {
		display: flex;
		align-items: center;
		margin: 0;
		padding: 0 10px 0 10px;
		border-top: solid;
		border-bottom: solid;
		height: 8vh;
		z-index: 100;
        overflow: hidden;
	}

	span {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}

	.buttons {
		display: flex;
        justify-content: flex-start;
        overflow: hidden;
		padding: 0;
		width: 100%;
	}

	li {
		padding: 0 1rem 0 1rem;
		text-decoration: none;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		
	}
	
	a {
		text-decoration: none;
		color: black;
		display: flex;
		align-items: center;
		justify-content: center;
		transition-duration: 0.35s;

		&:hover {
			color: red;
			text-decoration: underline;
		}
	}

	.navBox {
		display: flex;
		justify-content: space-between;
	}

	h4 {
		padding: 0 0.5em 0 0.5em;
		font-weight: normal;
		size: 1rem;
	}

	#menuButt {
		position: absolute;
		right: 10px;
		transition-duration: 0.35s;

		&:hover {
			color: red;
			cursor: pointer;
		}
	}
</style>
