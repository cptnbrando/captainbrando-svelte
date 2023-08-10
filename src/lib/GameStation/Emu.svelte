<script lang="ts">
    // This needs to be in the index.html initial file for svelte

    // Platform select
    var NepEmu = "n64";
    // ID of html element where the emulator will be inserted
    var NepPlayer = "#emulator";

    // var neogeoBios = "./test/bios/neogeo.zip";
    // Use default psxBios included with NeptunJS, as the psx bios files make it slower
    // var psxBios = "./test/bios/psxBios.zip";
    var psxSkipBios = false;

    // Add extra button on toolbar to scale up emulator. Disabled by default
    var NepZoom = "enable";
    // Maximum width size of emulator. 870px by default
    var NepMaxWidth = "1100px";
    // Interface language of the emulator. EN by default
    var NepLang = "en";
    // ( only for GBA ) GBA Bios Need for some games. Disabled by default
    var EmuGbaBios = "enable";
    
    function getGame() {
        let game = `/neptun/test/`;
        switch(NepEmu) {
            case "n64":
                game += "1m.zip";
                break;
            case "gba":
                game += "2p.zip";
                break;
            case "psx":
                game += "3s.zip";
                break;
            default:
                // Default to the first game
                game += "1m.zip";
                break;
        }

        return game;
    }

    // Game Url
    // var gameUrl = getGame();
    var gameUrl = `/neptun/test/1m.zip`;

    var scriptsus = document.createElement("script");
    scriptsus.setAttribute("data-name", "njs2");

    //doing integrity checks like loader
    scriptsus.src = "/neptun/NJS.gge";
    document.head.appendChild(scriptsus);
    var style = document.createElement("link");
    style.href = "/neptun/neptun.css";
    style.rel = "stylesheet";
    style.type = "text/css";
    document.head.appendChild(style);
</script>

<html id="emulator" lang="en"></html>