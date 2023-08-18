<script lang="ts">
    import Privacy from "../popup/Privacy.svelte";
    import { stories } from "./myNotes";

    const bgColors = [
        '75d89a',
        'a3ceef',
        'ed7a79'
    ];

    let backColor = `white`;

    // Popuptime, true if active
    let privy: boolean | null = null;

    let showNotes: boolean = true;

    let selectedNote: string | null = null;

    let notesOpenedCount = 0;

    const github: string = `https://raw.githubusercontent.com/dcruzships/dcruz-assets/master`;

    const video1Src = `${github}/vid/vid1.webm`;
    const video2Src = `${github}/vid/terry.webm`;

    const need2 = `${github}/music/notMine/need2.mp3`;
    const onGP = `${github}/music/notMine/onGP.mp3`;
    
    const start = (key: string) => {
        if(privy === null || privy === true) {
            privy = true;
            return;
        }

        showNotes = false;
        selectedNote = key;
        // TODO: make colors pop more...
        backColor = getColor();
    }

    const backOut = () => {
        showNotes = true;
        notesOpenedCount++;
        backColor = `white`;
    }

    function getColor(): string {
        return bgColors[Math.floor(Math.random()*bgColors.length)];
    }

</script>

<h1>BOOKS</h1>

{#each stories as key, index}
    {#if showNotes === true}
        <div class='note' id={`story${index}`} on:click={() => start(key)} on:keydown={() => {}}></div>
    {:else}
        <button class="marg" on:click={backOut}>cool, thanks</button>
        {#if selectedNote === key}
        <div class='fakenews marg'>
            <video src={video1Src} controls>
                <track kind="captions" />
            </video>
            <audio src={need2} controls controlsList="nodownload" />
            <p>{@html selectedNote}</p>
        </div>
        {/if}
    {/if}
{/each}
{#if notesOpenedCount > 1 && showNotes === true}
    <!-- <a href="https://www.youtube.com/@videogamedunkey/?sub_confirmation=1">Subscribe to VideoGameDunky Here!</a> -->
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
        background-color: #FF8303;
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
        overflow-y: scroll;
        overflow-x: hidden;
        max-height: 80%;
        height: 80%;
        width: 80%;
        max-width: 80%;
    }
    
    .marg {
        margin-left: 20px;
    }

    video {
        width: 30%;
        height: 30%;
        margin-left: 20vw;

        &:nth-of-type(1) {
            width: 55%;
            height: 55%;
        }
    }
</style>

