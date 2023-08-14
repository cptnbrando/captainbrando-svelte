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

    const github: string = `https://raw.githubusercontent.com/dcruzships/dcruz-assets/master`;

    const video1Src = `${github}/vid/vid1.webm`;
    const video2Src = `${github}/vid/terry.webm`;

    // const need2 = `${github}/music/notMine/need2.mp3`;
    const onGP = `${github}/music/notMine/onGP.mp3`;

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
        {#if selectedNote === key}
        <div class='fakenews'>
            <video src={video1Src} controls>
                <track kind="captions" />
            </video>
            <audio src={onGP} controls controlsList="nodownload" />
            <p>{@html selectedNote}</p>
        </div>
        {/if}
    {/if}
{/each}
{#if noteOpened === true && showNotes === true}
<video src={video2Src} controls>
    <track kind="captions" />
</video>
{/if}
{#if privy === true}
    <Privacy />
    <br />
    <br />
    <br />
    <br />
    <br />
    <button on:click={() => {privy = false}}>Click here to agree</button>
{/if}

<!-- <audio controls src="music\etc\isthereanybodyoutthere.mp3"></audio> -->
<!-- <h5>isthereanybodyoutthere.mp3</h5> -->


<style lang="scss">
    .note {
        height: 80px;
        width: 80px;
        border: solid;
        background-color: rgb(0, 20, 90);
        position: relative;
        top: 5%;
        left: 5%;
        margin: 15px;
        overflow-x: hidden;
        
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
        margin-left: 20vw;

        &:nth-of-type(1) {
            width: 60%;
            height: 60%;
        }
    }
</style>

