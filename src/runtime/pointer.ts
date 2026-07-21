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

/** Track pointer position over a canvas, in both device pixels and normalized units. */
export function createPointer(canvas: HTMLCanvasElement): PointerControl {
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

  const onMove = (e: PointerEvent): void => set(e);
  const onEnter = (e: PointerEvent): void => {
    pointer.active = true;
    set(e);
  };
  const onLeave = (): void => {
    pointer.active = false;
  };

  let attached = false;

  return {
    pointer,
    attach() {
      if (attached) return;
      attached = true;
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerenter', onEnter);
      canvas.addEventListener('pointerleave', onLeave);
    },
    detach() {
      if (!attached) return;
      attached = false;
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerenter', onEnter);
      canvas.removeEventListener('pointerleave', onLeave);
    },
  };
}
