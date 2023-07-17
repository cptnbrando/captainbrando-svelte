<script>
    import Emu from "./Emu.svelte";

    EJS_player = '#game';
    EJS_biosUrl = '/scph1001.bin'; // Url to Bios file
    // gameurl
    EJS_gameUrl = 'https://drive.google.com/u/0/nonceSigner?nonce=63pqs3m4ql246&continue=https://doc-00-6g-docs.googleusercontent.com/docs/securesc/4789avb5pb4p6s2gtvm7hgf4g1q8j0kv/eq4ihtu0qk6j99bag3v3jghjo4r65f15/1689561450000/13623365757509044785/13623365757509044785/1hUKuwGDYxrmc5aYLhlSj9PGJ1mSicCIe?e%3Ddownload%26ax%3DAGtFMPVbMVMVzbKho9pHOetOMuO2aqqVXRAaX-nCKAZ4QggZiN8k7ANWf63J9LUkxiSogidqSGbGfqxVK4GB9puTigHBxu83c1pEi9HcZ6jKc4-umlmz0mkRnadnqTnHzTgIP79zyKkfpJHE-jmJOg6bDvyA2JYZZ9UTgaU0uGppJNyovqlNfdnwBs280N1qpqc7xdOpp2qOgOCmjeoGL3WOWtN1llZMdQfAhfHZ_97LyBhR5Wmfyv5z__jhQC7T8lGDC0foilsMyoFfawMUIOb-2xvnSE1hafZ6B8-cdeELNvZlWtjXHY2XrOmizPyiEaIE-RW-fqFSVGezLqObFeevsiIsZsGxOjACdVS76YkQEltRdD_cu6gX_lvocj96gi_rU4CKNiSYgxk_LZPZGILdxOyoUJ1V6usRLcjQF1GXCaLc2l1rii_uUyfDF4g8nMrmh7kMEdnl3GmOVwH9L7ijPXWuxMyB0bT3BltHOZ6VVxq8k9Y67_nglemFl5auJDCEMm-jjs1rTeTtR0HYmE57y284aoxdJjW7QE9mvEgnFsGHY5ANrCFGkQdrTiupzSBW2we0xGM9-LI_w9Zy1pxwHMi0rhn3Go_EEviNa9HJLT82I7wjVZKugtGpEGOS4jik6ifCKemTUvN26MpWpGGLiVD1LqOrcbZyaA3BrgIAlMeuuLdM_AJ1rKg9VNZwO9WDhBSKJEpJz_EuOb6Gw389momPXQE4ayqG4_VLZ1TzVFbcxI__x30xyCtUbaPnX0PSMnGHr3obx6xsQzNi7iBs1jy5eXxn8Ax8Pn9x0UIHB7A7G37w1mcXDa-Y9nZ6jaHE1qX3_dBksumEZ0A1Sg-HYrafgtoO8R5DBQDstpNjjrR0dhkjyTUXQ_dz1heXpxfuJ5cBrYGfc-TN12rQd4lapm2tsdZUhNkRFUKnpig%26uuid%3D71348fec-d4cc-43d9-af52-37b70a51feba%26authuser%3D0&hash=q2s14v6ue6op53cd408kqmo14i1de2v7';
    EJS_core = 'psx';

    // https://drive.google.com/uc?export=download&id=1hUKuwGDYxrmc5aYLhlSj9PGJ1mSicCIe&confirm=t&uuid=71348fec-d4cc-43d9-af52-37b70a51feba
    // ???
</script>

<div class="container" id="emuPanel">
    <div class="emu-flex over" id="emuOver">
        <h3>Game Time</h3>
        <span>
            <button
                on:click={() => {
                    window.location.reload();
                }}>plz dont give up on me</button
            >
        </span>
        <div style="width:640px;height:480px;max-width:100%">
            <div id="game"></div>
        </div>
        <script src="https://www.emulatorjs.com/loader.js"></script>
        <br />
        <span>this games been really fun</span>
        <span>the most fun of my year</span>
        <br />
        <span>im gonna do better</span>
        <span>refresh the page</span>
        <span>try to live better</span>
        <span>lets be friends yall</span>
    </div>
    <div class="emu-flex" id="emuMain">
        <Emu />
    </div>
    <div class="emu-flex over" id="emuControls">
        <h3>Controls</h3>
        <span>WASD to move</span>
        <span>Enter to click!</span>
        <br />
        <span>J to do something</span>
        <span>K to do something else</span>
        <span>SPACE to crouch</span>
    </div>
</div>

<style lang="scss">
    .emu-flex {
        width: 100%;
        height: 100%;
    }

    #emuMain {
        flex: 9;
    }

    .over {
        z-index: 10;
        justify-content: center;
        align-items: center;
        padding: 1%;
        text-align: center;
        flex: 2;
    }

    #emuPanel {
        display: flex;
        width: 100%;
        height: 100%;
    }

    .container {
        position: relative;
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
    }

    button {
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
