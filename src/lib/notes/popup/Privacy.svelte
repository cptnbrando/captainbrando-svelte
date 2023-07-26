<script lang="ts">
    import { ArrowLeftIcon } from 'svelte-feather-icons';
    let pp: boolean = false;
</script>
<div class='PRIVATE'>
    <h2>WARNING</h2>
    <p>These notes (and this site) are protected by a Privacy Policy</p>
    {#if pp===true}
    <div>
        <pre class='fuckyou'>
            _                         _
           |_|                       |_|
           | |         /^^^\         | |
          _| |_      (| "o" |)      _| |_
        _| | | | _    (_---_)    _ | | | |_ 
       | | | | |' |    _| |_    | `| | | | |
       \          /   /     \   \          /
        \        /  / /(. .)\ \  \        /
          \    /  / /  | . |  \ \  \    /
            \  \/ /    ||Y||    \ \/  /
              \_/      || ||      \_/
                       () ()
                       || ||
                      ooO Ooo
       </pre>
       <button on:click={() => {pp = false}} class='butt'><ArrowLeftIcon size='25' />aight, you cool?</button>
       <p>snitches get stitches</p>
       <p>...</p>
       <p>privacy policies, regardless of visual styling or word choice, are very lame. But needed, because privacy on the internet has never existed.</p>
       <p>to read my books, you must refrain from judgement, immitation, and subsequent thoughts or actions.</p>
       <p>by clicking agree on the previous page, you vow to forget about everything you read on captainbrando.com as you read it.</p>
       <p>thank you</p>
    </div>
    {:else}
        <button on:click={() => {pp = true}}>Click here to view Privacy Policy</button>
    {/if}
</div>

<style>
    .PRIVATE {
        position: sticky;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        max-height: 65%;
        overflow-y: auto;
        padding-top: 14vh;
        /* scroll-margin: 20vh; */
    }

    .fuckyou {
        display: block;
    }

    .butt {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>