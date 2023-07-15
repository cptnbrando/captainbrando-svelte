<script lang="ts">
    import Privacy from "../popup/Privacy.svelte";
    import { onMount } from "svelte";
    import { stories } from "./myNotes";

    // Everything goes here, because maps are fast.
    let reports = new Map();

    // Popuptime, true if active
    let privy: boolean | null = null;

    let showNotes: boolean = true;

    let selectedNote: string | null = null;

    let noteOpened: boolean = false;

    const video1Src = 'vid/vid1.webm';
    const video2Src = 'vid/terry.webm';

    let need2 = 'music/etc/need2.mp3'

	onMount(async () => {
		stories.forEach((el, i) => {
            reports.set(`story${i}`, el)
        });
	});
    
    const start = (key: string) => {
        if(privy === null || privy === true) {
            privy = true;
            return;
        }

        showNotes = false;
        selectedNote = key;
    }

    const down = () => {

    }

</script>

<h1>BOOKS</h1>

{#each stories as key, index}
    {#if showNotes === true}
        <div class='note' id={`story${index}`} on:click={() => start(key)} on:keydown={down}></div>
    {:else}
        <button on:click={() => {showNotes = true; noteOpened = true;}}>cool, thanks</button>
        <div class='fakenews'>
            <video src={video1Src} controls />
            <audio src={need2} controls controlsList="nodownload" />
            <p>{@html selectedNote}</p>
        </div>
    {/if}
{/each}
{#if noteOpened === true}
<video src={video2Src} controls />
{/if}
{#if privy === true}
    <Privacy {privy} />
    <br />
    <br />
    <br />
    <br />
    <br />
    <button on:click={() => {privy = false}}>Click here to agree</button>
{/if}

<style lang="scss">
    .note {
        height: 80px;
        width: 80px;
        border: solid;
        background-color: black;
        position: relative;
        top: 5%;
        left: 5%;
        margin: 15px;
        
        &:hover {
            cursor: pointer;
        }
    }

    .fakenews {
        overflow: scroll;
        max-height: 80%;
        height: 80%;
        width: 80%;
        max-width: 80%;
    }

    video {
        width: 30%;
        height: 30%;
    }


</style>

