<script lang="ts">
	// Tap copies a link to this song; hold it for 1.5s and it downloads instead
	import { createEventDispatcher } from "svelte";
	import { Share2Icon } from "svelte-feather-icons";
	import { type Track, isMixtape, MIXTAPE_SUFFIX } from "./tracks";

	const COPY_MSG = "copied to clip🛹!";
	const HOLD_MS = 1500;

	export let track: Track;

	const dispatch = createEventDispatcher();
	const flash = (msg: string) => dispatch("flash", msg);

	let holdTimer: ReturnType<typeof setTimeout>;
	// The click that ends a hold shouldn't also copy the link
	let held = false;

	function shareSong() {
		if (held) {
			held = false;
			return;
		}
		const file = track.src.split("/").pop();
		// Mixtape reissues share the same .mp3 as the original, so tag the link: ?song=BEGIN.mp3-mixtape
		const fullUrl = `${window.location.origin}/?song=${file}${isMixtape(track.album) ? MIXTAPE_SUFFIX : ""}`;
		if (navigator.clipboard) navigator.clipboard.writeText(fullUrl).then(() => flash(COPY_MSG));
		else flash("No HTTPS ?");
	}

	function holdStart() {
		held = false;
		clearTimeout(holdTimer);
		holdTimer = setTimeout(() => {
			held = true;
			flash("Downloading...");
			window.open(track.src, "_blank");
		}, HOLD_MS);
	}

	function holdEnd() {
		clearTimeout(holdTimer);
	}
</script>

<button
	type="button"
	class="flex h-10 w-10 shrink-0 items-center justify-center transition hover:scale-[1.15] hover:text-neutral-500 active:scale-95 active:text-brand"
	title="copy a link to this song (hold to download)"
	on:click={shareSong}
	on:pointerdown={holdStart}
	on:pointerup={holdEnd}
	on:pointerleave={holdEnd}
	on:pointercancel={holdEnd}
	on:contextmenu|preventDefault
>
	<Share2Icon size="20" />
</button>
