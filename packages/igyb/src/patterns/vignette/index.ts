import { defineCanvas2D } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type VignetteOptions = {
	/** Edge darkness (0–1). Default `0.55`. */
	intensity?: number;
	/** Fraction of the radius left clear before darkening begins. Default `0.45`. */
	inner?: number;
};

/**
 * A soft radial darkening at the edges, on a transparent canvas — layer it on top (via
 * {@link layers}) to focus the eye toward the centre. Static; pair with `animate: false`.
 */
export const vignette: BackgroundFactory<VignetteOptions> = defineCanvas2D<VignetteOptions>({
	defaults: { intensity: 0.55, inner: 0.45 },
	frame(env) {
		const { ctx, surface, options } = env;
		const { width: w, height: h } = surface;
		ctx.clearRect(0, 0, w, h);
		const cx = w / 2;
		const cy = h / 2;
		const inner = Math.min(w, h) * (options.inner ?? 0.45);
		const outer = Math.hypot(w, h) / 2;
		const g = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
		g.addColorStop(0, 'rgba(0, 0, 0, 0)');
		g.addColorStop(1, `rgba(0, 0, 0, ${options.intensity ?? 0.55})`);
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, w, h);
	}
});
