// test
import "./app.scss";
import App from "./App.svelte";
import { setupOffline } from "./lib/music/offline";
import { albums } from "./lib/music/tracks";

const app = new App({
	target: document.getElementById("app"),
});

// Keep the whole site (and every song you've heard) for offline, forever.
// Album art is warmed up front so the list looks right with no network
window.addEventListener("load", () => setupOffline(albums.map((a) => a.src)));

export default app;
