import { defineCanvas2D } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type SpotlightOptions = {
	/** Clear-radius of the spotlight in CSS pixels. Default `200`. */
	radius?: number;
	/** Darkness outside the spotlight (0–1). Default `0.72`. */
	dim?: number;
};

/**
 * A cursor-following reveal: darkens everything except a soft circle around the pointer, on a
 * transparent canvas. Layer it over another pattern (via {@link layers}) so the pattern only
 * shows near the cursor. Needs `interactive`; falls back to a flat dim when the pointer is away.
 */
export const spotlight: BackgroundFactory<SpotlightOptions> = defineCanvas2D<SpotlightOptions>({
	defaults: { radius: 200, dim: 0.72 },
	frame(env) {
		const { ctx, surface, options, pointer } = env;
		const { width: w, height: h, dpr } = surface;
		ctx.clearRect(0, 0, w, h);
		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = `rgba(0, 0, 0, ${options.dim ?? 0.72})`;
		ctx.fillRect(0, 0, w, h);

		if (!(options.interactive && pointer.active)) return;
		const r = (options.radius ?? 200) * dpr;
		const px = pointer.nx * w;
		const py = pointer.ny * h;
		const g = ctx.createRadialGradient(px, py, 0, px, py, r);
		g.addColorStop(0, 'rgba(0, 0, 0, 1)');
		g.addColorStop(0.7, 'rgba(0, 0, 0, 1)');
		g.addColorStop(1, 'rgba(0, 0, 0, 0)');
		ctx.globalCompositeOperation = 'destination-out'; // punch a soft hole in the dim
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, w, h);
		ctx.globalCompositeOperation = 'source-over';
	}
});
