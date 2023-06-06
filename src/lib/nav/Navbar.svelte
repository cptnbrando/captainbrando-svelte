<script lang="ts">
	import Typed from './Typed.svelte';
	import { HomeIcon, PackageIcon, MusicIcon, EditIcon, MailIcon, MenuIcon } from 'svelte-feather-icons';
	import { fly, fade } from 'svelte/transition';

	export let isMobile: boolean = false;
	export let navHeight: any = 60;
	let show: boolean = false;
	let size: string = "2x";
</script>

<nav class="sticky" on:mouseenter={() => show = true} on:mouseleave={() => show = false} style="height: {navHeight}px;">
	<span>
		{#if show}
		<ul in:fly="{{ x: -600, duration: 400, delay: 200 }}" out:fly="{{ x: -600, duration: 400 }}" class="buttons">
			<li>
				<a href="#banner">
					<HomeIcon {size} />
					{#if !isMobile}
					<h4>Home</h4>
					{/if}
				</a>
			</li>
			<li>
				<a href="#projects">
					<PackageIcon {size} />
					{#if !isMobile}
					<h4>Projects</h4>
					{/if}
				</a>
			</li>
			<li>
				<a href="#music">
					<MusicIcon {size} />
					{#if !isMobile}
					<h4>Music</h4>
					{/if}
				</a>
			</li>
			<!-- <li>
				<EditIcon size="2x" />
				<a href="/blog">Blog</a>
			</li> -->
			<li>
				<a href="#contact">
					<MailIcon {size} />
					{#if !isMobile}
					<h4>Contact</h4>
					{/if}
				</a>
			</li>
		</ul>
		{:else}
		<span class="navBox">
			<div id="typer" in:fade="{{ duration: 200, delay: 400 }}" out:fly="{{ x: -400, duration: 200 }}">
				<Typed />
			</div>
		</span>
		{/if}
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

	@media only screen and (max-width: 800px) {
		li {
			padding: 0 0.5rem 0 0.5rem;
		}
	}
</style>
