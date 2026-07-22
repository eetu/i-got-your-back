import { defineCanvas2D } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type GrainOptions = {
	/** Grain opacity (0–1). Default `0.08`. */
	intensity?: number;
	/** Noise-cell size in CSS pixels. Default `1.5`. */
	scale?: number;
};

/**
 * Animated film-grain / dither overlay on a transparent canvas — layer it over another
 * pattern (via {@link layers}, often with `blend: 'overlay'`) for a tactile, filmic finish.
 */
export const grain: BackgroundFactory<GrainOptions> = defineCanvas2D<GrainOptions>({
	defaults: { intensity: 0.08, scale: 1.5 },
	setup(env) {
		// Bake one tile of monochrome noise; drawn tiled + jittered each frame.
		const tile = 128;
		const off = document.createElement('canvas');
		off.width = tile;
		off.height = tile;
		const octx = off.getContext('2d');
		if (!octx) return;
		const img = octx.createImageData(tile, tile);
		const d = img.data;
		for (let i = 0; i < d.length; i += 4) {
			const v = (Math.random() * 255) | 0;
			d[i] = v;
			d[i + 1] = v;
			d[i + 2] = v;
			d[i + 3] = 255;
		}
		octx.putImageData(img, 0, 0);
		env.state.tile = off;
	},
	frame(env) {
		const { ctx, surface, options } = env;
		const { width: w, height: h, dpr } = surface;
		ctx.clearRect(0, 0, w, h);
		const off = env.state.tile as HTMLCanvasElement | undefined;
		if (!off) return;
		const size = 128 * Math.max(1, (options.scale ?? 1.5) * dpr);
		ctx.globalAlpha = options.intensity ?? 0.08;
		const ox = (Math.random() * size) | 0;
		const oy = (Math.random() * size) | 0;
		for (let y = -oy; y < h; y += size) {
			for (let x = -ox; x < w; x += size) {
				ctx.drawImage(off, x, y, size, size);
			}
		}
		ctx.globalAlpha = 1;
	}
});
