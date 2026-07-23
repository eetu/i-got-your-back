/** Window scroll position, for scroll-linked patterns. */
export type Scroll = {
	/** `window.scrollY` in pixels. */
	y: number;
	/** Document scroll progress, `0` (top) … `1` (bottom). */
	progress: number;
};

export type ScrollControl = {
	scroll: Scroll;
	attach(): void;
	detach(): void;
};

/** Track window scroll position + document progress via a passive listener. */
export function createScroll(): ScrollControl {
	const scroll: Scroll = { y: 0, progress: 0 };

	function read(): void {
		const y = window.scrollY || 0;
		const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
		scroll.y = y;
		scroll.progress = Math.min(1, Math.max(0, y / max));
	}

	const onScroll = (): void => read();
	let attached = false;

	return {
		scroll,
		attach() {
			if (attached) return;
			attached = true;
			read();
			window.addEventListener('scroll', onScroll, { passive: true });
		},
		detach() {
			if (!attached) return;
			attached = false;
			window.removeEventListener('scroll', onScroll);
		}
	};
}
