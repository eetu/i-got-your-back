import { defineCanvas2D } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type TruchetOptions = {
  /** Tile size in CSS pixels. Default `52`. */
  tile?: number;
  /** Arc line width in CSS pixels. Default `7`. */
  lineWidth?: number;
};

/** Deterministic per-cell hash → stable tile orientation across re-renders. */
function hash2(x: number, y: number): number {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * Classic quarter-arc Truchet tiling. Geometry is fixed (deterministic per cell);
 * a diagonal wave animates accent color, and the pointer lifts a radial highlight.
 */
export const truchet: BackgroundFactory<TruchetOptions> = defineCanvas2D<TruchetOptions>({
  defaults: { tile: 52, lineWidth: 7 },
  frame(env) {
    const { ctx, surface, palette, options, pointer, time } = env;
    const dpr = surface.dpr;
    const t = Math.max(8, (options.tile ?? 52) * dpr);
    const lw = Math.max(1, (options.lineWidth ?? 7) * dpr);
    const animating = options.animate !== false;

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, surface.width, surface.height);
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';

    const cols = Math.ceil(surface.width / t) + 1;
    const rows = Math.ceil(surface.height / t) + 1;
    const r = t / 2;
    const px = pointer.nx * surface.width;
    const py = pointer.ny * surface.height;
    const reach = Math.max(surface.width, surface.height) * 0.35;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const h = hash2(col, row);
        const x = col * t;
        const y = row * t;

        const wave = 0.5 + 0.5 * Math.sin((col + row) * 0.55 - (animating ? time * 1.6 : 0));
        let intensity = 0.35 + 0.65 * wave;
        if (options.interactive && pointer.active) {
          const d = Math.hypot(x + r - px, y + r - py);
          intensity = Math.min(1, intensity + Math.max(0, 1 - d / reach) * 0.9);
        }

        ctx.strokeStyle = palette.accent(h);
        ctx.globalAlpha = intensity;
        ctx.beginPath();
        if (h & 1) {
          ctx.arc(x + t, y, r, Math.PI * 0.5, Math.PI);
          ctx.moveTo(x, y + r);
          ctx.arc(x, y + t, r, Math.PI * 1.5, Math.PI * 2);
        } else {
          ctx.arc(x, y, r, 0, Math.PI * 0.5);
          ctx.moveTo(x + t, y + r);
          ctx.arc(x + t, y + t, r, Math.PI, Math.PI * 1.5);
        }
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  },
});
