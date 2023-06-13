<script lang="ts">
    import Emu from "./Emu.svelte";

    function refresh() {
        window.location.reload();
    }
</script>

<div class="container" id="emuPanel">
    <div class="emu-flex over" id="emuOver">
        <span>
            <button
                on:click={() => {
                    window.location.reload();
                }}>Click to play game</button
            >
        </span>
        <br />
        <span>...then click Start Game</span>
        <span>...then click the pause button</span>
    </div>
    <div class="emu-flex" id="emuMain">
        <Emu />
    </div>
    <div class="emu-flex over" id="emuControls">
        <span>WASD to move</span>
        <span>Enter to click!</span>
        <br />
        <span>J to do something</span>
        <span>K to do something else</span>
    </div>
</div>

<style lang="scss">
    .emuFlex {
        width: 100%;
        height: 100%;
        flex: 2;
    }

    #emuMain {
        flex: 9;
    }

    .over {
        z-index: 10;
        justify-content: center;
        align-items: center;
        padding-top: 1%;
    }

    #emuPanel {
        display: flex;
        width: 100%;
        height: 100%;
    }

    #emuOver {
        padding-left: 2%;
    }

    #emuControls {
        padding-right: 2%;
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
</style>
