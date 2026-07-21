import { shade } from '../../runtime/color';
import { defineCanvas2D } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type DotGridOptions = {
	/** Grid spacing in CSS pixels. Default `34`. */
	spacing?: number;
	/** Base dot radius in CSS pixels. Default `3`. */
	dotSize?: number;
};

/** A lattice of dots that swell on an ambient wave; when interactive, the pointer
 * sends a ripple ring rolling outward across the grid. */
export const dotGrid: BackgroundFactory<DotGridOptions> = defineCanvas2D<DotGridOptions>({
	defaults: { spacing: 34, dotSize: 3 },
	frame(env) {
		const { ctx, surface, palette, options, pointer, time } = env;
		const dpr = surface.dpr;
		const gap = Math.max(8, (options.spacing ?? 34) * dpr);
		const r0 = Math.max(1, (options.dotSize ?? 3) * dpr);
		const animating = options.animate !== false;

		ctx.fillStyle = palette.bg;
		ctx.fillRect(0, 0, surface.width, surface.height);

		const cols = Math.ceil(surface.width / gap) + 1;
		const rows = Math.ceil(surface.height / gap) + 1;
		const px = pointer.nx * surface.width;
		const py = pointer.ny * surface.height;
		const reach = Math.max(surface.width, surface.height) * 0.45;

		for (let j = 0; j < rows; j++) {
			for (let i = 0; i < cols; i++) {
				const x = i * gap;
				const y = j * gap;
				let s = animating ? 0.5 + 0.5 * Math.sin((x + y) * 0.012 - time * 1.6) : 0.6;
				if (options.interactive && pointer.active) {
					const d = Math.hypot(x - px, y - py);
					s += Math.sin(d * 0.045 - time * 6) * Math.max(0, 1 - d / reach) * 0.9;
				}
				s = Math.max(0.05, Math.min(1.3, s));
				ctx.fillStyle = shade(palette.accent(i + j), 0.5 + 0.6 * s);
				ctx.beginPath();
				ctx.arc(x, y, r0 * (0.35 + 0.9 * s), 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}
});
