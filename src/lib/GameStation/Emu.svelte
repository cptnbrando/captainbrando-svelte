<script lang="ts">
	// This needs to be here for some reason. Something about styles, idk, don't touch it
	// Go to the root index \captainbrando-svelte\index.html to change what you need to change for games

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

<html id="emulator" lang="en" />
