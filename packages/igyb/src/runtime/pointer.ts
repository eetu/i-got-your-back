/** One tracked pointer/touch, in device pixels and normalized units. */
export type PointerPoint = { x: number; y: number; nx: number; ny: number };

export type Pointer = {
	/** Primary position in device pixels (last-moved pointer; eased when smoothing > 0). */
	x: number;
	y: number;
	/** Normalized primary position (0–1), origin top-left. */
	nx: number;
	ny: number;
	/** Whether any pointer is currently over the surface. */
	active: boolean;
	/**
	 * All currently-active pointers (multitouch). Empty when idle; a hovering mouse counts
	 * as one. Positions are raw (un-eased) so touch patterns stay responsive.
	 */
	points: PointerPoint[];
};

export type PointerControl = {
	pointer: Pointer;
	attach(): void;
	detach(): void;
	/** Set the easing amount for the primary pointer (0 = instant, higher = smoother). */
	setSmoothing(amount: number): void;
	/** Advance the smoothed primary position toward its target by `dt` seconds. Call once per frame. */
	step(dt: number): void;
};

/**
 * Track pointer position over a canvas, in device pixels and normalized units, with
 * multitouch (`pointer.points`). `source: 'window'` listens on the window instead of the
 * canvas — use it when the canvas sits behind `pointer-events: none` (e.g. a full-page
 * background layer), so it still follows the pointer even while it's over other content.
 *
 * The primary position (`x/y/nx/ny`) eases toward the latest event position when smoothing
 * > 0 (see {@link PointerControl.step}); with smoothing 0 it snaps immediately.
 */
export function createPointer(
	canvas: HTMLCanvasElement,
	source: 'element' | 'window' = 'element'
): PointerControl {
	const pointer: Pointer = { x: 0, y: 0, nx: 0.5, ny: 0.5, active: false, points: [] };
	// Every active pointer by id (multitouch), plus the target for the eased primary.
	const active = new Map<number, { nx: number; ny: number }>();
	let tnx = 0.5;
	let tny = 0.5;
	let smoothing = 0;

	function commitPrimary(): void {
		pointer.x = pointer.nx * canvas.width;
		pointer.y = pointer.ny * canvas.height;
	}

	// Rebuild the public multitouch list from the active map (raw positions, device px).
	// Called on every event and every frame so it's current after a drop or a resize.
	function rebuildPoints(): void {
		pointer.points.length = 0;
		for (const p of active.values()) {
			pointer.points.push({
				nx: p.nx,
				ny: p.ny,
				x: p.nx * canvas.width,
				y: p.ny * canvas.height
			});
		}
	}

	function norm(e: PointerEvent): [number, number] {
		const r = canvas.getBoundingClientRect();
		return [
			(e.clientX - r.left) / Math.max(1, r.width),
			(e.clientY - r.top) / Math.max(1, r.height)
		];
	}

	function track(e: PointerEvent): void {
		const [nx, ny] = norm(e);
		active.set(e.pointerId, { nx, ny });
		tnx = nx;
		tny = ny;
		pointer.active = true;
		rebuildPoints();
		if (smoothing <= 0) {
			pointer.nx = tnx;
			pointer.ny = tny;
			commitPrimary();
		}
	}

	function drop(e: PointerEvent): void {
		active.delete(e.pointerId);
		if (active.size === 0) pointer.active = false;
		rebuildPoints();
	}

	const onDown = (e: PointerEvent): void => track(e);
	const onMove = (e: PointerEvent): void => track(e);
	// A lifted touch/pen leaves; a mouse keeps hovering, so don't drop it on button-up.
	const onUp = (e: PointerEvent): void => {
		if (e.pointerType !== 'mouse') drop(e);
	};
	const onCancel = (e: PointerEvent): void => drop(e);
	const onLeave = (e: PointerEvent): void => drop(e);
	// window mode: this pointer left the viewport entirely
	const onOut = (e: PointerEvent): void => {
		if (!e.relatedTarget) drop(e);
	};

	let attached = false;

	return {
		pointer,
		attach() {
			if (attached) return;
			attached = true;
			if (source === 'window') {
				window.addEventListener('pointermove', onMove);
				window.addEventListener('pointerdown', onDown);
				window.addEventListener('pointerup', onUp);
				window.addEventListener('pointercancel', onCancel);
				window.addEventListener('pointerout', onOut);
			} else {
				canvas.addEventListener('pointermove', onMove);
				canvas.addEventListener('pointerdown', onDown);
				canvas.addEventListener('pointerup', onUp);
				canvas.addEventListener('pointercancel', onCancel);
				canvas.addEventListener('pointerleave', onLeave);
			}
		},
		detach() {
			if (!attached) return;
			attached = false;
			active.clear();
			pointer.active = false;
			pointer.points.length = 0;
			if (source === 'window') {
				window.removeEventListener('pointermove', onMove);
				window.removeEventListener('pointerdown', onDown);
				window.removeEventListener('pointerup', onUp);
				window.removeEventListener('pointercancel', onCancel);
				window.removeEventListener('pointerout', onOut);
			} else {
				canvas.removeEventListener('pointermove', onMove);
				canvas.removeEventListener('pointerdown', onDown);
				canvas.removeEventListener('pointerup', onUp);
				canvas.removeEventListener('pointercancel', onCancel);
				canvas.removeEventListener('pointerleave', onLeave);
			}
		},
		setSmoothing(amount: number): void {
			smoothing = Math.max(0, amount);
		},
		step(dt: number): void {
			if (smoothing > 0) {
				// Frame-rate-independent exponential ease; tau grows with `smoothing`.
				const tau = 0.03 + smoothing * 0.25;
				const a = dt > 0 ? 1 - Math.exp(-dt / tau) : 1;
				pointer.nx += (tnx - pointer.nx) * a;
				pointer.ny += (tny - pointer.ny) * a;
			} else {
				pointer.nx = tnx;
				pointer.ny = tny;
			}
			commitPrimary();
			rebuildPoints();
		}
	};
}
