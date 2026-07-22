import { defineCanvas2D } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type ScanlinesOptions = {
	/** Line spacing in CSS pixels. Default `4`. */
	spacing?: number;
	/** Line darkness (0–1). Default `0.22`. */
	intensity?: number;
};

/**
 * CRT-style horizontal scanlines that drift slowly, on a transparent canvas — layer it over
 * another pattern (via {@link layers}) for a retro monitor feel.
 */
export const scanlines: BackgroundFactory<ScanlinesOptions> = defineCanvas2D<ScanlinesOptions>({
	defaults: { spacing: 4, intensity: 0.22 },
	frame(env) {
		const { ctx, surface, options, time } = env;
		const { width: w, height: h, dpr } = surface;
		ctx.clearRect(0, 0, w, h);
		const gap = Math.max(2, (options.spacing ?? 4) * dpr);
		const thick = gap * 0.5;
		ctx.fillStyle = `rgba(0, 0, 0, ${options.intensity ?? 0.22})`;
		const drift = (time * 16 * dpr) % gap;
		for (let y = drift - gap; y < h; y += gap) {
			ctx.fillRect(0, y, w, thick);
		}
	}
});
