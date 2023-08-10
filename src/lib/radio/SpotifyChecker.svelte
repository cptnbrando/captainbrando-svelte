<script lang='ts'>
    const spotifyClientID: string = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const spotifySecret: string = import.meta.env.VITE_SPOTIFY_SECRET;

    let live: boolean = false;
</script>

<div>
    {#if live}
        <h3>Captain Brando is online!</h3>
    {:else}
        <h3>Captain Brando is offline...</h3>
    {/if}
</div>

<style>
    div {
        border: solid;
        margin-top: 5%;
        padding-left: 1%;
        padding-right: 1%;
    }
</style>
