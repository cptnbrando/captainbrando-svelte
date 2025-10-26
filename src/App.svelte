<script lang="ts">
	import { onMount } from "svelte";
	import Navbar from "./lib/nav/Navbar.svelte";
	import Games from "./lib/GameStation/Games.svelte";
	import Music from "./lib/music/Music.svelte";
	import Contact from "./lib/contact/Contact.svelte";
	import Notes from "./lib/notes/panel/Notes.svelte";
	import Radio from "./lib/radio/Radio.svelte";
	import Donations from "./lib/money/Donations.svelte";
	import AINote from "./lib/notes/AINote.svelte";

	let scrollEvent: any = null;
	let scrollTimestamp: number = 0;
	let isMobile: boolean = window.innerWidth < 800;

	function onScroll(event: Event) {
		if (event.timeStamp - scrollTimestamp > 500) {
			// console.log(event.timeStamp - scrollTimestamp);
			scrollTimestamp = event.timeStamp;
			scrollEvent = event;
		}
	}

	function onResize() {
		isMobile = window.innerWidth < 800;
		// navHeight = window.innerHeight * 0.08;
		// navHeight = (navHeight < 50) ? 50 : navHeight;
		// articleHeight = window.innerHeight - navHeight;
	}

	onMount(async () => {
		onResize();
	});
</script>

<svelte:window on:resize={onResize} />
<main
	on:scroll={(e) => {
		onScroll(e);
	}}
>
	<Navbar {isMobile} />
	<!-- <article id="music">
		<Music {scrollEvent} {isMobile} />
	</article>
	<article id="games">
		<Games {isMobile} />
	</article> -->
	<!-- <article id="notes">
    <Notes />
  </article>
  <article id="donations">
    <Donations />
  </article> -->
  <article>
	  <img src="https://media.istockphoto.com/id/2099668042/photo/a-white-flag-image.jpg?s=1024x1024&w=is&k=20&c=s4VTQvnoHZ07lv-4ydiF_dbjt4N1CpCjDVDRdwTkQ-8=" id="fuck" />
  </article>

  <article>
	  <AINote />
  </article>

</main>

<style lang="scss">
	:root {
		font-family: "Open Sans", sans-serif;
		overflow-y: hidden;
		user-select: none;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		width: auto;
		height: auto;

		/* Disable text highlighting */
		-webkit-touch-callout: none; /* iOS Safari */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Old versions of Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
		user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
		-webkit-tap-highlight-color: transparent;
	}

#fuck {
   width: 69vw;
   height: 69vh;
}

	article {
		scroll-snap-align: start;
		scroll-snap-stop: always;
		scroll-margin: 69px;
		height: calc(100vh - 60px);
		// padding-top: 69px;
	}

	#music {
		position: relative;
	}

	main {
		padding: 0;
		margin: 0;
		scroll-snap-type: y mandatory;
		scroll-behavior: smooth;
		// scroll-padding-top: 670px;
		max-height: 99vh;
		overflow-x: hidden;
		padding-top: 5px;
	}

	#music {
		position: relative;
	}

	// #projects {
	//   overflow: hidden;
	// }

	// Chrome + IE + Opera
	@supports (overflow-y: overlay) {
		main {
			overflow-y: overlay;
		}

		main::-webkit-scrollbar {
			width: 15px;
			height: 10px;
		}

		main::-webkit-scrollbar-thumb {
			background-image: linear-gradient(180deg, #d03643 0%, rgb(35, 41, 59) 99%);
			border-radius: 100px;
			border: 2px solid transparent;
			background-clip: content-box;
		}

		main::-webkit-scrollbar-track {
			border-radius: 101px;
		}
	}

	// Firefox
	@supports not (overflow-y: overlay) {
		main {
			overflow-y: scroll;
			scrollbar-color: black rgba(255, 255, 255, 0);
			scrollbar-gutter: stable;
			scrollbar-width: thin;
		}
	}

	// #banner {
	//   display: flex;
	//   flex-direction: column;
	//   padding-top: 0;
	// }

	@media only screen and (max-width: 600px) {
		article {
			// height: calc(100vh - 6vh);
			height: calc(100vh - 16vh);
			// scroll-margin: 0px;
			// margin-bottom: 69px;
		}
	}
</style>
