import { shade } from '../../runtime/color';
import { defineCanvas2D } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type HexOptions = {
  /** Hex radius (center to corner) in CSS pixels. Default `34`. */
  radius?: number;
  /** Gap between hexes in CSS pixels. Default `3`. */
  gap?: number;
};

function hash2(x: number, y: number): number {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

/** Flat-top hex tessellation with a shimmering brightness wave and a pointer ripple. */
export const hex: BackgroundFactory<HexOptions> = defineCanvas2D<HexOptions>({
  defaults: { radius: 34, gap: 3 },
  frame(env) {
    const { ctx, surface, palette, options, pointer, time } = env;
    const dpr = surface.dpr;
    const r = Math.max(6, (options.radius ?? 34) * dpr);
    const gap = (options.gap ?? 3) * dpr;
    const animating = options.animate !== false;

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, surface.width, surface.height);

    const hw = r * 1.5; // horizontal spacing (flat-top)
    const vh = Math.sqrt(3) * r; // vertical spacing
    const cols = Math.ceil(surface.width / hw) + 1;
    const rows = Math.ceil(surface.height / vh) + 1;
    const rr = r - gap;

    const px = pointer.nx * surface.width;
    const py = pointer.ny * surface.height;
    const reach = Math.max(surface.width, surface.height) * 0.3;

    for (let col = 0; col <= cols; col++) {
      for (let row = 0; row <= rows; row++) {
        const cx = col * hw;
        const cy = row * vh + (col % 2 ? vh / 2 : 0);

        let b = 0.4 + 0.35 * Math.sin(cx * 0.01 + cy * 0.012 - (animating ? time * 1.4 : 0));
        if (options.interactive && pointer.active) {
          const d = Math.hypot(cx - px, cy - py);
          b += Math.max(0, 1 - d / reach) * 0.7;
        }
        b = Math.max(0.12, Math.min(1.25, b));

        ctx.fillStyle = shade(palette.accent(hash2(col, row)), b);
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (Math.PI / 3) * k;
          const x = cx + rr * Math.cos(a);
          const y = cy + rr * Math.sin(a);
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }
    }
  },
});
