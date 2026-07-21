import { defineCanvas2D } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type WaveLinesOptions = {
	/** Vertical spacing between lines in CSS pixels. Default `26`. */
	spacing?: number;
	/** Wave amplitude multiplier. Default `1`. */
	amplitude?: number;
};

/** Layered undulating contour lines — a topographic / sound-line look. The pointer
 * bulges the lines it passes near. */
export const waveLines: BackgroundFactory<WaveLinesOptions> = defineCanvas2D<WaveLinesOptions>({
	defaults: { spacing: 26, amplitude: 1 },
	frame(env) {
		const { ctx, surface, palette, options, pointer, time } = env;
		const dpr = surface.dpr;
		const gap = Math.max(10, (options.spacing ?? 26) * dpr);
		const amp = gap * 0.5 * (options.amplitude ?? 1);
		const animating = options.animate !== false;
		const t = animating ? time : 0;

		ctx.fillStyle = palette.bg;
		ctx.fillRect(0, 0, surface.width, surface.height);
		ctx.lineWidth = Math.max(1, 1.4 * dpr);
		ctx.lineCap = 'round';

		const step = Math.max(4, 6 * dpr);
		const rows = Math.ceil(surface.height / gap) + 2;
		const px = pointer.nx * surface.width;
		const py = pointer.ny * surface.height;
		const sigma = Math.max(surface.width, surface.height) * 0.09;

		for (let r = 0; r < rows; r++) {
			const baseY = r * gap;
			ctx.strokeStyle = palette.accent(r);
			ctx.globalAlpha = 0.75;
			ctx.beginPath();
			for (let x = 0; x <= surface.width + step; x += step) {
				let d =
					Math.sin(x * 0.008 + t * 0.6 + r * 0.3) * amp +
					Math.sin(x * 0.017 - t * 0.4 + r * 0.5) * amp * 0.45;
				if (options.interactive && pointer.active) {
					const dist2 = (x - px) * (x - px) + (baseY - py) * (baseY - py);
					d -= Math.exp(-dist2 / (2 * sigma * sigma)) * gap * 1.8;
				}
				const y = baseY + d;
				if (x === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			}
			ctx.stroke();
		}
		ctx.globalAlpha = 1;
	}
});
