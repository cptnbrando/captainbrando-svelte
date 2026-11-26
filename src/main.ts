// test
import "./app.scss";
import App from "./App.svelte";
import { loadSaved } from "./lib/music/offline";

const app = new App({
	target: document.getElementById("app"),
});

// Which songs are already saved on this device (they play with no signal)
loadSaved();

export default app;
