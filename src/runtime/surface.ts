export type Surface = {
  canvas: HTMLCanvasElement;
  /** Backing-store width in device pixels. */
  width: number;
  /** Backing-store height in device pixels. */
  height: number;
  /** Effective device-pixel-ratio. */
  dpr: number;
};

export type SurfaceControl = {
  surface: Surface;
  /** Re-read the host size and resize the backing store. */
  measure(): void;
  /** Observe host resizes; `cb` runs after each re-measure. */
  observe(cb: () => void): void;
  destroy(): void;
};

/** Create a canvas that fills `target`, with device-pixel-ratio scaling. */
export function createSurface(target: HTMLElement, dprOverride?: number): SurfaceControl {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';

  if (getComputedStyle(target).position === 'static') {
    target.style.position = 'relative';
  }
  target.appendChild(canvas);

  const surface: Surface = { canvas, width: 0, height: 0, dpr: 1 };

  function measure(): void {
    const dpr = dprOverride ?? Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, target.clientWidth);
    const h = Math.max(1, target.clientHeight);
    surface.dpr = dpr;
    surface.width = Math.round(w * dpr);
    surface.height = Math.round(h * dpr);
    canvas.width = surface.width;
    canvas.height = surface.height;
  }

  let ro: ResizeObserver | undefined;

  function observe(cb: () => void): void {
    ro = new ResizeObserver(() => {
      measure();
      cb();
    });
    ro.observe(target);
  }

  function destroy(): void {
    ro?.disconnect();
    ro = undefined;
    canvas.remove();
  }

  return { surface, measure, observe, destroy };
}
