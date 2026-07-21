export type Loop = {
	start(): void;
	stop(): void;
	readonly running: boolean;
};

/**
 * A single requestAnimationFrame loop. `onFrame` receives delta-seconds since the
 * previous frame (clamped, and `0` on the first frame after a start).
 */
export function createLoop(onFrame: (dtSeconds: number) => void): Loop {
	let raf = 0;
	let last = 0;
	let running = false;

	function tick(now: number): void {
		const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
		last = now;
		onFrame(dt);
		raf = requestAnimationFrame(tick);
	}

	return {
		start() {
			if (running) return;
			running = true;
			last = 0;
			raf = requestAnimationFrame(tick);
		},
		stop() {
			if (!running) return;
			running = false;
			cancelAnimationFrame(raf);
		},
		get running() {
			return running;
		}
	};
}
