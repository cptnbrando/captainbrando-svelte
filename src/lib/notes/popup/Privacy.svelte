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
       <p>regardless, no. I don't give anybody, or anything, permission to view, read, download, extract, plagiarize, eat, consume, imagine, look at, breath at, listen to, preach, abstract, contemplate, annunciate, or believe anything written on this page, especially anything in my books. Which, of course, are most definately purely fictional I pinkie swear. Do not make this news. Do not make this a social media thing. Don't share it, speak it, think it, and definately do not do anything you read about here. Or else.</p>
       <p>That goes for anything you've already seen, and anything you see next. This is mine, not yours, leave it for me.</p>
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