import { shade } from '../../runtime/color';
import { defineCanvas2D } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type IsoOptions = {
  /** Half-width of a cube's top diamond in CSS pixels. Default `40`. */
  size?: number;
};

function hash2(x: number, y: number): number {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

/** Repeating isometric cube lattice: faces shaded from one accent, heights bobbing on a wave. */
export const iso: BackgroundFactory<IsoOptions> = defineCanvas2D<IsoOptions>({
  defaults: { size: 40 },
  frame(env) {
    const { ctx, surface, palette, options, pointer, time } = env;
    const dpr = surface.dpr;
    const w = Math.max(10, (options.size ?? 40) * dpr);
    const h = w * 0.5;
    const base = w * 0.95;
    const animating = options.animate !== false;

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, surface.width, surface.height);
    ctx.lineJoin = 'round';

    const parX = options.interactive && pointer.active ? (pointer.nx - 0.5) * w * 3 : 0;
    const parY = options.interactive && pointer.active ? (pointer.ny - 0.5) * h * 3 : 0;
    const cx0 = surface.width / 2 + parX;
    const cy0 = surface.height / 2 + parY;

    const uMax = Math.ceil(surface.width / (2 * w)) + 2;
    const vMax = Math.ceil(surface.height / (2 * h)) + 6;

    // Iterate depth-first (v ascending) so nearer cubes paint over farther ones.
    for (let v = -vMax; v <= vMax; v++) {
      for (let u = -uMax; u <= uMax; u++) {
        if (((u + v) & 1) !== 0) continue; // keep the integer cube lattice
        const sx = cx0 + u * w;
        const sy = cy0 + v * h;
        const ch =
          base * (0.55 + 0.45 * Math.sin(u * 0.45 - v * 0.25 - (animating ? time * 1.5 : 0)));
        const accent = palette.accent(hash2(u, v));

        // top diamond
        ctx.fillStyle = shade(accent, 1.25);
        ctx.beginPath();
        ctx.moveTo(sx, sy - ch - h);
        ctx.lineTo(sx + w, sy - ch);
        ctx.lineTo(sx, sy - ch + h);
        ctx.lineTo(sx - w, sy - ch);
        ctx.closePath();
        ctx.fill();

        // left face
        ctx.fillStyle = shade(accent, 0.7);
        ctx.beginPath();
        ctx.moveTo(sx - w, sy - ch);
        ctx.lineTo(sx, sy - ch + h);
        ctx.lineTo(sx, sy + h);
        ctx.lineTo(sx - w, sy);
        ctx.closePath();
        ctx.fill();

        // right face
        ctx.fillStyle = shade(accent, 0.46);
        ctx.beginPath();
        ctx.moveTo(sx + w, sy - ch);
        ctx.lineTo(sx, sy - ch + h);
        ctx.lineTo(sx, sy + h);
        ctx.lineTo(sx + w, sy);
        ctx.closePath();
        ctx.fill();
      }
    }
  },
});
