/**
 * Keeps the streaming <audio> element alive through network trouble.
 *
 * With the phone screen off, the OS powers the radio down between bursts and
 * the browser throttles the page, so a long stream can drop its connection
 * mid-song (a MEDIA_ERR_NETWORK error) or just stop receiving data (a stall).
 * Without this the element sits there "playing" silence forever. Nobody is
 * looking at the screen to press play again, so it picks itself back up:
 * reload the same URL and seek back to where it was. Only after a few failed
 * attempts does the player hear about it (onDead).
 */

// First retry is immediate: a hidden, silent page may not get timers back for
// a while (iOS suspends it), but it is still inside the error event right now
const RETRY_DELAYS_MS = [0, 2000, 6000];
// How long a playing element may sit without its clock moving before the
// stream counts as stalled
const STALL_TIMEOUT_MS = 10000;
// Movement smaller than this during a stall check is buffering jitter
const STALL_PROGRESS_EPSILON_S = 0.25;

export class StreamGuard {
	private attempts = 0;
	private hasPlayed = false;
	private lastTime = 0;
	private stallTimer: ReturnType<typeof setTimeout> | null = null;
	private retryTimer: ReturnType<typeof setTimeout> | null = null;
	private pendingResume: (() => void) | null = null;

	/**
	 * @param el the streaming element to watch
	 * @param wantsPlayback true while the player means to be playing
	 * @param onDead called once the stream can't be recovered
	 */
	constructor(
		private el: HTMLMediaElement,
		private wantsPlayback: () => boolean,
		private onDead: () => void
	) {
		el.addEventListener("error", () => this.handleError());
		el.addEventListener("playing", () => {
			this.attempts = 0;
			this.hasPlayed = true;
			this.clearStall();
		});
		el.addEventListener("timeupdate", () => {
			if (el.currentTime > 0) this.lastTime = el.currentTime;
		});
		el.addEventListener("waiting", () => this.armStall());
		el.addEventListener("stalled", () => this.armStall());
	}

	/** A new track is going into the element: forget the old one's history */
	reset(): void {
		this.attempts = 0;
		this.hasPlayed = false;
		this.lastTime = 0;
		this.clearStall();
		clearTimeout(this.retryTimer);
		this.dropPendingResume();
	}

	/**
	 * The element (or its <source>) failed to fetch. A <source> failure has no
	 * error code — it could be a 404 or a dropped connection — so it's retried.
	 */
	handleError(): void {
		// A URL that never loaded at all (404, blocked, not audio) won't fix
		// itself by asking again. Anything that dies after it played is a
		// dropped connection worth retrying.
		const neverLoaded = !this.hasPlayed && this.el.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED;
		if (neverLoaded || !this.retry()) this.onDead();
	}

	private armStall(): void {
		if (this.stallTimer || !this.wantsPlayback()) return;
		const startedAt = this.el.currentTime;
		this.stallTimer = setTimeout(() => {
			this.stallTimer = null;
			if (!this.wantsPlayback() || this.el.paused || this.el.ended) return;
			if (this.el.currentTime - startedAt > STALL_PROGRESS_EPSILON_S) return;
			if (!this.retry()) this.onDead();
		}, STALL_TIMEOUT_MS);
	}

	private clearStall(): void {
		clearTimeout(this.stallTimer);
		this.stallTimer = null;
	}

	/** false when out of attempts (or nothing to retry) */
	private retry(): boolean {
		if (!this.wantsPlayback() || this.attempts >= RETRY_DELAYS_MS.length) return false;
		const delay = RETRY_DELAYS_MS[this.attempts];
		this.attempts++;
		this.clearStall();
		clearTimeout(this.retryTimer);
		if (delay === 0) this.reload();
		else this.retryTimer = setTimeout(() => this.reload(), delay);
		return true;
	}

	private reload(): void {
		if (!this.wantsPlayback()) return;
		const el = this.el;
		const resumeAt = this.lastTime;
		this.dropPendingResume();
		const resume = () => {
			this.dropPendingResume();
			if (resumeAt > 0) el.currentTime = resumeAt;
			if (this.wantsPlayback()) el.play().catch(() => {});
		};
		this.pendingResume = resume;
		el.addEventListener("loadedmetadata", resume);
		el.load();
	}

	/** A retry's seek-back belongs to its own track, never the next one */
	private dropPendingResume(): void {
		if (!this.pendingResume) return;
		this.el.removeEventListener("loadedmetadata", this.pendingResume);
		this.pendingResume = null;
	}
}
