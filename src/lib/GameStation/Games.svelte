<script lang="ts">
    import Emu from "./Emu.svelte";

    export let isMobile: boolean = false;

    // gameurl - google drive link but it expires mad quick... i dont wanna use the google api its so annoyingly complicated... ugh
    // EJS_gameUrl = `https://doc-00-6g-docs.googleusercontent.com/docs/securesc/4789avb5pb4p6s2gtvm7hgf4g1q8j0kv/5j89525m00denskns5a2vg0im5bhcv08/1689561750000/13623365757509044785/13623365757509044785/1hUKuwGDYxrmc5aYLhlSj9PGJ1mSicCIe?e=download&ax=AGtFMPW-sg3JjeN1Rttdk-6utfKybEkEgPxR2V2ACvolKiTOgAqoH2oLmwIPn9_Fzek6BXvJY5P49fV9szZNfkxMA_W0kJ5McydKk6uJmt9e1wVgDA8cu_sOqnS2zq0T4Uvb70nM9xuWpHI98Fzpxgk0u-OIwW7mVCCIjkt1InYgmGw_aiF1fgsNK0LcQQWMcLJpawWfW1ICgrDPvWmK7oleiuoRoyJFNuP-4FVUuYKt1rzKyu6pvp1dwy1rz1G0-g688NDPEeFltPolwCwK-t-Sv5fySgI3L1TfqaK6i-IyudyA3Kf032pZUV_iNjb1rEdRmpo7IjzL01kh8K6Q2hkj021KOiu3jZKftSaxgYL0vT8chvnE2QzuL_OWxgGlsKVlJXydOjBh5oH9CnehhsMAskOEM2BILfQjetVzwKxHqOPi6InMGBdR_VljUpdCQ-QL1GmHeUraVo-S7eMKH-9GNlCNMjJnifhflSbHNFK-F3se1iHwZob5YKnt0h2PIB7P61AoUZmvRf_IFdnj_5VzqZgDWUy76cgmJgSVmDJNj9MIgvfg14OFzfRc0-ObpI8uIvXDsSyI-OJH-sjVWpOnqY7Og0hijz-cmed-N_XqZrs8pFOzAV7mEyVTtri0e_msJxnnQP0hQFCcr3_o1xL0RTgt3jzg3OAkiOh-HX_zqiveWcnFV0BOtZMgP_lFGcend1XhxNtHQqpyU_XzB4Z5kdOdnka-B2bPLERTxRB4BZIIF-t8kuKJTCFb8DLR9pSccMyhJYPe2FxCiqPJiKFh1zcqUJQMaDjNOxkO_wcNaiBuSyEzYXdHMBx1vMm7bNHhGVNVYdBAjotgD2G_5L_VJr8oa4jw9tmMGVAxKNXMWQ1lXnvDjmqah_8gPupCtzJVRj1OnYV8o7_LTGqmljOAAxj0JAA3o--P99p826U&uuid=71348fec-d4cc-43d9-af52-37b70a51feba&authuser=0&nonce=7b755jahjgi02&user=13623365757509044785&hash=na53nrdba4q98ma09pkod31ah3u0dnih`;

    // https://drive.google.com/uc?export=download&id=1hUKuwGDYxrmc5aYLhlSj9PGJ1mSicCIe&confirm=t&uuid=71348fec-d4cc-43d9-af52-37b70a51feba
    // ???
</script>

<div class="container" id="emuPanel">
    <!-- {#if !isMobile} -->
    <div class="emu-flex over" id="emuOver">
        <h3>Game Time</h3>
        <span>
            <button
                on:click={() => {
                    window.location.reload();
                }}>click to reload</button
            >
        </span>
        <br>
        <br>
        <span>Click this button ☝️ if you don't see anything</span>
        <br>
        <span>Then click the [Start Game] button at the top</span>
        <br>
        <span>After it loads, click the blinking pause symbol at the top ⏸️</span>
        <br>
        <span>bada bing bada boom!</span>
    </div>
    <div class="emu-flex" id="emuMain">
        <Emu />
    </div>
    <div class="emu-flex over" id="emuControls">
        <h3>Controls</h3>
        <span>Arrow Keys to move</span>
        <br />
        <span>Z to do something</span>
        <span>X to do something else</span>
        <span>C to do more</span>
        <span>D to do less (crouch)</span>
    </div>
    <!-- {:else}
    <div class="emu-flex" id="emuMain">
        <h1>No games on mobile for now...</h1>
    </div>
    {/if} -->
</div>

<style lang="scss">

    .container {
        display: flex;
        text-align: center;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        margin-top: 3rem;
    }

    .emu-flex {
        flex: 1;
    }

    #emuMain {
        flex: 5;
    }

    .over {
        align-self: flex-start;
        padding: 2%;
    }

    span {
        display: flex;
        flex-direction: column;
        width: 100%;
        align-items: center;
        justify-content: center;
    }
    
    button {
        margin-left: 6px;
        --c: #229091; /* the color*/

        box-shadow: 0 0 0 0.1em inset var(--c);
        --_g: linear-gradient(var(--c) 0 0) no-repeat;
        background: var(--_g) calc(var(--_p, 0%) - 100%) 0%,
            var(--_g) calc(200% - var(--_p, 0%)) 0%,
            var(--_g) calc(var(--_p, 0%) - 100%) 100%,
            var(--_g) calc(200% - var(--_p, 0%)) 100%;
        background-size: 50.5% calc(var(--_p, 0%) / 2 + 0.5%);
        outline-offset: 0.1em;
        transition: background-size 0.4s, background-position 0s 0.4s;

        cursor: pointer;
        padding: 0.1em 0.6em;
        font-weight: bold;
        border: none;

        &:hover {
            --_p: 100%;
            transition: background-position 0.4s, background-size 0s;
        }

        &:active {
            box-shadow: 0 0 9e9Q inset #0009;
            background-color: var(--c);
            color: #fff;
        }
    }
</style>
