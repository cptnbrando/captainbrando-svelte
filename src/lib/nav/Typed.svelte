<script lang="ts">
	import { heads } from "./heads";
	import { onMount, onDestroy } from "svelte";

	export let isMobile: boolean = false;

	let text: string = "Captain Brando is ";

	const MOBILE_HEAD_MAX_LENGTH = 14;

	// Speed (in milliseconds) of typing.
	const speedForward = 250; //Typing Speed
	const speedWait = 2500; // Wait between typing and backspacing
	const speedBetweenLines = 2000; //Wait between first and second lines
	const speedBackspace = 100; //Backspace Speed

	let headerEl: HTMLHeadingElement;
	let paragraphEl: HTMLParagraphElement;

	// The full word pool, and the "bag" of words not yet shown this cycle.
	// Drawing from a bag (and refilling it when empty) means no repeats within
	// a cycle and no running out of words, ever.
	let selectedHeads: string[] = [];
	let bag: string[] = [];

	// One timer drives the whole animation; cancelled on destroy so a dead
	// component can never keep typing into a live one
	let timer: ReturnType<typeof setTimeout>;
	let destroyed = false;

	function schedule(fn: () => void, ms: number) {
		clearTimeout(timer);
		timer = setTimeout(() => {
			if (!destroyed) fn();
		}, ms);
	}

	function nextWord(): string {
		if (bag.length === 0) bag = [...selectedHeads];
		const i = Math.floor(Math.random() * bag.length);
		return bag.splice(i, 1)[0];
	}

	// Move the blinking cursor to whichever line is being typed/erased
	function setCursor(el: HTMLElement) {
		headerEl.classList.toggle("cursor", el === headerEl);
		paragraphEl.classList.toggle("cursor", el === paragraphEl);
	}

	function typeWord() {
		const word = nextWord();
		// A "|" in a word splits it into header line + paragraph line.
		// Spreading a string splits it into whole code points, so emoji type
		// as one character instead of two broken halves
		const pipe = word.indexOf("|");
		const head = [...(pipe === -1 ? word : word.slice(0, pipe))];
		const para = [...(pipe === -1 ? "" : word.slice(pipe + 1))];
		setCursor(headerEl);
		typeHeader(head, para, 0);
	}

	function typeHeader(head: string[], para: string[], i: number) {
		if (i < head.length) {
			headerEl.textContent += head[i];
			schedule(() => typeHeader(head, para, i + 1), speedForward);
		} else if (para.length > 0) {
			schedule(() => {
				setCursor(paragraphEl);
				typeParagraph(para, 0);
			}, speedBetweenLines);
		} else {
			schedule(backspace, speedWait);
		}
	}

	function typeParagraph(para: string[], i: number) {
		if (i < para.length) {
			paragraphEl.textContent += para[i];
			schedule(() => typeParagraph(para, i + 1), speedForward);
		} else {
			schedule(backspace, speedWait);
		}
	}

	function backspace() {
		const para = [...(paragraphEl.textContent ?? "")];
		const head = [...(headerEl.textContent ?? "")];
		if (para.length > 0) {
			setCursor(paragraphEl);
			paragraphEl.textContent = para.slice(0, -1).join("");
			schedule(backspace, speedBackspace);
		} else if (head.length > 0) {
			setCursor(headerEl);
			headerEl.textContent = head.slice(0, -1).join("");
			schedule(backspace, speedBackspace);
		} else {
			schedule(typeWord, 50);
		}
	}

	onMount(() => {
		selectedHeads = isMobile ? heads.filter((el) => el.length < MOBILE_HEAD_MAX_LENGTH) : [...heads];
		typeWord();
	});

	onDestroy(() => {
		destroyed = true;
		clearTimeout(timer);
	});
</script>

<span id="typed">
	<span>{text}</span>
	<span style="width: 5px" />
	<div class="typedBox">
		<div class="output" id="output">
			<!-- svelte-ignore a11y-missing-content -->
			<h1 class="cursor" bind:this={headerEl} />
			<p bind:this={paragraphEl} />
		</div>
	</div>
</span>

<style>
	#typed {
		height: inherit;
	}

	#typed,
	.typedBox {
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
