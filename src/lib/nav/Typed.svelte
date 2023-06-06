<script lang="ts">
	import { heads } from "./heads";
	import { onMount } from "svelte";

	let text: string = "brandon dcruz is ";
	let array: string[] = heads;

	// values to keep track of the number of letters typed, which quote to use. etc. Don't change these values.
	let i = 0;
	let a = 0;
	let isBackspacing = false;
	let isParagraph = false;

	// Speed (in milliseconds) of typing.
	const speedForward = 250; //Typing Speed
	const speedWait = 2500; // Wait between typing and backspacing
	const speedBetweenLines = 2000; //Wait between first and second lines
	const speedBackspace = 100; //Backspace Speed

	onMount(async () => {
		a = Math.floor(Math.random() * (array.length - 1));
		typeWriter(array);
	});

	function typeWriter(ar: string[]) {
		const element = document.querySelector("#output");
		const aString = ar[a];
		if (!element) return;

		const eHeader = element.children.item(0); //Header element
		const eParagraph = element.children.item(1); //Subheader element

		if (!eHeader || !eParagraph) return;

		// Determine if animation should be typing or backspacing
		if (!isBackspacing) {
			// If full string hasn't yet been typed out, continue typing
			if (i < aString.length) {
				// If character about to be typed is a pipe, switch to second line and continue.
				if (aString.charAt(i) == "|") {
					isParagraph = true;
					eHeader.classList.remove("cursor");
					eParagraph.classList.add("cursor");
					i++;
					setTimeout(() => {
						typeWriter(ar);
					}, speedBetweenLines);

					// If character isn't a pipe, continue typing.
				} else {
					// Type header or subheader depending on whether pipe has been detected
					if (!isParagraph) {
						eHeader.innerHTML = eHeader.innerHTML + aString.charAt(i);
					} else {
						eParagraph.innerHTML = eParagraph.innerHTML + aString.charAt(i);
					}
					i++;
					setTimeout(() => {
						typeWriter(ar);
					}, speedForward);
				}

				// If full string has been typed, switch to backspace mode.
			} else if (i == aString.length) {
				isBackspacing = true;
				setTimeout(() => {
					typeWriter(ar);
				}, speedWait);
			}

			// If backspacing is enabled
		} else {
			// If either the header or the paragraph still has text, continue backspacing
			if (eHeader.innerHTML.length > 0 || eParagraph.innerHTML.length > 0) {
				// If paragraph still has text, continue erasing, otherwise switch to the header.
				if (eParagraph.innerHTML.length > 0) {
					eParagraph.innerHTML = eParagraph.innerHTML.substring(
						0,
						eParagraph.innerHTML.length - 1
					);
				} else if (eHeader.innerHTML.length > 0) {
					eParagraph.classList.remove("cursor");
					eHeader.classList.add("cursor");
					eHeader.innerHTML = eHeader.innerHTML.substring(
						0,
						eHeader.innerHTML.length - 1
					);
				}
				setTimeout(() => {
					typeWriter(ar);
				}, speedBackspace);

				// If neither head or paragraph still has text, switch to next quote in array and start typing.
			} else {
				isBackspacing = false;
				i = 0;
				isParagraph = false;
				// New random word
				a = Math.floor(Math.random() * (array.length - 1));
				setTimeout(() => {
					typeWriter(ar);
				}, 50);
			}
		}
	}
</script>

<span id="typed">
	<span>{text}</span>
	<span style="width: 5px" />
	<div class="container py-5">
		<div class="output" id="output">
			<!-- svelte-ignore a11y-missing-content -->
			<h1 class="cursor" />
			<p />
		</div>
	</div>
</span>

<style>
	#typed {
		height: inherit;
	}

	#typed,
	.py-5 {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.output {
		font-family: "Open Sans", sans-serif;
		color: black;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	h1 {
		font-size: 19px;
		padding: 0;
		margin: 0;
		height: 100%;
		display: flex;
		justify-content: center;
	}

	/* Cursor Styling */

	.cursor::after {
		content: "";
		display: inline-block;
		margin-left: 3px;
		background-color: red;
		animation-name: blink;
		animation-duration: 0.8s;
		animation-iteration-count: infinite;
	}

	h1.cursor::after {
		height: 24px;
		width: 13px;
	}

	@keyframes blink {
		0% {
			opacity: 1;
		}

		49% {
			opacity: 1;
		}

		50% {
			opacity: 0;
		}

		100% {
			opacity: 0;
		}
	}
</style>
