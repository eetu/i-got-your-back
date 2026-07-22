export type Pointer = {
	/** Position in device pixels. */
	x: number;
	y: number;
	/** Normalized position (0–1), origin top-left. */
	nx: number;
	ny: number;
	/** Whether the pointer is currently over the surface. */
	active: boolean;
};

export type PointerControl = {
	pointer: Pointer;
	attach(): void;
	detach(): void;
};

/**
 * Track pointer position over a canvas, in device pixels and normalized units.
 * `source: 'window'` listens on the window instead of the canvas — use it when the
 * canvas sits behind `pointer-events: none` (e.g. a full-page background layer), so it
 * still follows the pointer even while it's over other content.
 */
export function createPointer(
	canvas: HTMLCanvasElement,
	source: 'element' | 'window' = 'element'
): PointerControl {
	const pointer: Pointer = { x: 0, y: 0, nx: 0.5, ny: 0.5, active: false };

	function set(e: PointerEvent): void {
		const r = canvas.getBoundingClientRect();
		const nx = (e.clientX - r.left) / Math.max(1, r.width);
		const ny = (e.clientY - r.top) / Math.max(1, r.height);
		pointer.nx = nx;
		pointer.ny = ny;
		pointer.x = nx * canvas.width;
		pointer.y = ny * canvas.height;
	}

	const onMove = (e: PointerEvent): void => {
		if (source === 'window') pointer.active = true;
		set(e);
	};
	const onEnter = (e: PointerEvent): void => {
		pointer.active = true;
		set(e);
	};
	const onLeave = (): void => {
		pointer.active = false;
	};
	// window mode: the pointer left the viewport entirely
	const onOut = (e: PointerEvent): void => {
		if (!e.relatedTarget) pointer.active = false;
	};

	let attached = false;

	return {
		pointer,
		attach() {
			if (attached) return;
			attached = true;
			if (source === 'window') {
				window.addEventListener('pointermove', onMove);
				window.addEventListener('pointerout', onOut);
			} else {
				canvas.addEventListener('pointermove', onMove);
				canvas.addEventListener('pointerenter', onEnter);
				canvas.addEventListener('pointerleave', onLeave);
			}
		},
		detach() {
			if (!attached) return;
			attached = false;
			if (source === 'window') {
				window.removeEventListener('pointermove', onMove);
				window.removeEventListener('pointerout', onOut);
			} else {
				canvas.removeEventListener('pointermove', onMove);
				canvas.removeEventListener('pointerenter', onEnter);
				canvas.removeEventListener('pointerleave', onLeave);
			}
		}
	};
}
