<script lang="ts">
    let pp: boolean = false;
    let bigPenis: boolean = false;
    export let privy: boolean;
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
       <button on:click={() => {pp = false}}>aight, you cool?</button>
       <p>snitches get stitches</p>
       <p>...</p>
       <p>i will assault you physically, and verbally, should you feel the need to interpret these notes negatively.</p>
       <p>shut down your machine if your emotions overwhlem you, or compel you to be a little bitch about expression, or idk man shut down if you not feelin it</p>
       <p>nobody gives a fuck either way. about you, about me, certainly not about these notes</p>
       <p>unless you do give a fuck about these notes</p>
       <p>in which case, like if these past few sentences have already made you feel uneasy, please go away. there's nothing further down here for you.</p>
    </div>
    {:else}
        <button on:click={() => {pp = true}}>Click here to read the Privacy Policy</button>
    {/if}
</div>

<style>
    .PRIVATE {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .fuckyou {
        display: block;
    }
</style>