<script lang="ts">
    import Emu from "./Emu.svelte";
    import { emulators } from "./games-info";

    let selectedEmu = 'N64';
    let selectedGame = 'none';

    function refresh() {
        window.location.reload();
    }

</script>

<div class="container">
    <div id="emuMain">
        <Emu />
    </div>
    <div class='over' id='emuOver'>
        <span>
            <button on:click={() => {window.location.reload()}}>Click to play game</button>
        </span>
        <br>
        <span>WASD to move</span>
        <span>Enter to click!</span>
        <br>
        <span>J to do something</span>
        <span>K to do something else</span>
        <!-- <span>
            <label for='select-emus'>Emulator</label>
            <select value={selectedEmu} name="select-emus" id="select-emus">
                {#each emulators as emu}
                    <option value={emu.name_sub}>
                        {emu.name}
                    </option>
                {/each}
            </select>
        </span>
        <span class='reverse'>
            <label for='select-games'>Game</label>
            <select value={selectedGame} name="select-games" id="select-games">
                {#each emulators as emu}
                    <option value='none'>
                        None yet...
                    </option>
                {/each}
            </select>
        </span> -->
    </div>
</div>

<style lang="scss">
    #emuMain,
    #emuOver {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
    }

    .over {
        z-index: 10;
    }

    .container {
        position: relative;
    }

    span {
        display: flex;
        flex-direction: column;
        width: 15%;
        align-items: center;
    }

    button {
        margin-left: 6px;
    }

</style>