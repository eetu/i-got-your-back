import { defineCanvas2D } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type PlasmaBallOptions = {
	/** Number of electric filaments. Default `6`. */
	bolts?: number;
	/** Core sphere radius as a fraction of `min(width, height)`. Default `0.12`. */
	coreRadius?: number;
	/** Filament jaggedness in CSS pixels. Default `14`. */
	jitter?: number;
};

/** Build a jagged bolt path from (x0,y0) to (x1,y1); ends are anchored, middle wobbles. */
function boltPath(
	ctx: CanvasRenderingContext2D,
	x0: number,
	y0: number,
	x1: number,
	y1: number,
	seed: number,
	time: number,
	amp: number
): void {
	const dx = x1 - x0;
	const dy = y1 - y0;
	const len = Math.hypot(dx, dy) || 1;
	const px = -dy / len;
	const py = dx / len;
	const segs = 9;
	ctx.beginPath();
	ctx.moveTo(x0, y0);
	for (let i = 1; i < segs; i++) {
		const t = i / segs;
		const taper = Math.sin(Math.PI * t); // anchor both ends, bulge in the middle
		// three octaves of pseudo-noise → erratic, lightning-like rather than a regular zigzag
		const w =
			(Math.sin(i * 2.7 + seed * 5.1 + time * 11) +
				0.6 * Math.sin(i * 6.1 - seed * 3.3 + time * 17) +
				0.35 * Math.sin(i * 11.3 + seed * 1.7 - time * 23)) *
			amp *
			taper;
		// nudge vertices along the axis too, so they aren't evenly spaced
		const jt = t + Math.sin(i * 3.1 + seed) * 0.02;
		ctx.lineTo(x0 + dx * jt + px * w, y0 + dy * jt + py * w);
	}
	ctx.lineTo(x1, y1);
}

/**
 * A static-electricity globe: a glowing plasma core with crackling filaments. The bolts
 * reach toward every active pointer/touch point (multitouch — like fingers on the glass),
 * and lazily wander around the sphere when untouched. Enable `interactive` to make it react.
 */
export const plasmaBall: BackgroundFactory<PlasmaBallOptions> = defineCanvas2D<PlasmaBallOptions>({
	defaults: { bolts: 6, coreRadius: 0.12, jitter: 14 },
	frame(env) {
		const { ctx, surface, palette, options, pointer, time } = env;
		const { width: w, height: h, dpr } = surface;

		ctx.fillStyle = palette.bg;
		ctx.fillRect(0, 0, w, h);

		const cx = w / 2;
		const cy = h / 2;
		const R = Math.min(w, h) * (options.coreRadius ?? 0.12);
		const reach = Math.min(w, h) * 0.42;
		const nb = Math.max(1, Math.round(options.bolts ?? 6));
		const amp = (options.jitter ?? 14) * dpr;

		// Targets: active pointers (multitouch), else an idle wandering ring.
		const touches = options.interactive ? pointer.points : [];

		ctx.globalCompositeOperation = 'lighter';
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		for (let i = 0; i < nb; i++) {
			let tx: number;
			let ty: number;
			if (touches.length) {
				const p = touches[i % touches.length];
				// Fan a couple of bolts around each touch so it reads as a cluster.
				const spread = (Math.floor(i / touches.length) - 0.5) * 0.35;
				const a = Math.atan2(p.y - cy, p.x - cx) + spread;
				const d = Math.hypot(p.x - cx, p.y - cy);
				tx = cx + Math.cos(a) * d;
				ty = cy + Math.sin(a) * d;
			} else {
				const ang = time * 0.25 + (i / nb) * Math.PI * 2;
				const rr = reach * (0.72 + 0.18 * Math.sin(time * 0.7 + i * 1.7));
				tx = cx + Math.cos(ang) * rr;
				ty = cy + Math.sin(ang) * rr;
			}

			const a0 = Math.atan2(ty - cy, tx - cx);
			const sx = cx + Math.cos(a0) * R * 0.9;
			const sy = cy + Math.sin(a0) * R * 0.9;
			const color = palette.accent(i);

			boltPath(ctx, sx, sy, tx, ty, i + 1, time, amp);
			ctx.strokeStyle = color;
			ctx.globalAlpha = 0.18;
			ctx.lineWidth = 7 * dpr;
			ctx.stroke(); // soft glow
			ctx.strokeStyle = palette.fg;
			ctx.globalAlpha = 0.9;
			ctx.lineWidth = 1.6 * dpr;
			ctx.stroke(); // bright core

			// A little burst where the bolt lands (on the "glass" / fingertip).
			ctx.globalAlpha = 0.5;
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.arc(tx, ty, 3 * dpr, 0, Math.PI * 2);
			ctx.fill();
		}

		// Faint glass envelope framing the globe.
		ctx.globalAlpha = 0.07;
		ctx.strokeStyle = palette.accent(1);
		ctx.lineWidth = 2 * dpr;
		ctx.beginPath();
		ctx.arc(cx, cy, reach, 0, Math.PI * 2);
		ctx.stroke();

		// Glowing core sphere, additively over the bolts (with a subtle flicker).
		ctx.globalAlpha = 1;
		const flick = 1 + 0.05 * Math.sin(time * 6.3);
		const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.5 * flick);
		g.addColorStop(0, palette.fg);
		g.addColorStop(0.4, palette.accent(0));
		g.addColorStop(1, 'rgba(0, 0, 0, 0)');
		ctx.fillStyle = g;
		ctx.beginPath();
		ctx.arc(cx, cy, R * 1.5 * flick, 0, Math.PI * 2);
		ctx.fill();

		ctx.globalCompositeOperation = 'source-over';
		ctx.globalAlpha = 1;
	}
});
