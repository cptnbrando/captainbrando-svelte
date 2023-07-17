<script>
    import Emu from "./Emu.svelte";

    EJS_player = '#game';
    EJS_biosUrl = ''; // Url to Bios file
    EJS_gameUrl = ''; // Url to Game rom
    EJS_core = 'psx';
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
