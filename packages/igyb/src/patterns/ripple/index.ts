import { defineCanvas2D } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type RippleOptions = {
	/**
	 * Ring expansion rate in CSS px/s. Default `160`. (Named `expand`, not `speed`, so it
	 * doesn't shadow the base `speed` time-multiplier.)
	 */
	expand?: number;
	/** Ring lifetime in seconds. Default `2.4`. */
	life?: number;
	/** Seconds between rings shed by a held/moving pointer. Default `0.16`. */
	interval?: number;
};

type Drop = { x: number; y: number; age: number; ci: number };

const MAX_DROPS = 220;

/**
 * Concentric water-ripples that emanate from every active pointer/touch point (multitouch).
 * When idle it keeps a gentle rain of ripples going, so it's alive without interaction; enable
 * `interactive` to drive it by touch.
 */
export const ripple: BackgroundFactory<RippleOptions> = defineCanvas2D<RippleOptions>({
	defaults: { expand: 160, life: 2.4, interval: 0.16 },
	setup(env) {
		const st = env.state as { drops?: Drop[]; acc?: number; idle?: number };
		st.drops ??= [];
		st.acc ??= 0;
		st.idle ??= 0;
	},
	frame(env) {
		const { ctx, surface, palette, options, pointer, dt } = env;
		const { width: w, height: h, dpr } = surface;
		const st = env.state as { drops: Drop[]; acc: number; idle: number };

		ctx.fillStyle = palette.bg;
		ctx.fillRect(0, 0, w, h);

		const life = options.life ?? 2.4;
		const expand = (options.expand ?? 160) * dpr;

		st.acc += dt;
		if (options.interactive && pointer.points.length) {
			if (st.acc >= (options.interval ?? 0.16)) {
				st.acc = 0;
				for (const p of pointer.points) {
					st.drops.push({ x: p.x, y: p.y, age: 0, ci: (Math.random() * 4) | 0 });
				}
			}
		}
		// Idle rain — always on, so the field never sits empty (a lone drop now and then even
		// while interacting adds life).
		st.idle -= dt;
		if (st.idle <= 0) {
			st.idle = 0.28 + Math.random() * 0.5;
			st.drops.push({ x: Math.random() * w, y: Math.random() * h, age: 0, ci: (Math.random() * 4) | 0 });
		}
		if (st.drops.length > MAX_DROPS) st.drops.splice(0, st.drops.length - MAX_DROPS);

		for (let i = st.drops.length - 1; i >= 0; i--) {
			const d = st.drops[i];
			d.age += dt;
			const k = d.age / life;
			if (k >= 1) {
				st.drops.splice(i, 1);
				continue;
			}
			const r = d.age * expand;
			const fade = (1 - k) * (1 - k);
			const color = palette.accent(d.ci);

			// Bright drop-splash right at the impact, fading fast.
			const splash = Math.max(0, 1 - d.age / 0.35);
			if (splash > 0) {
				ctx.globalAlpha = splash * 0.9;
				ctx.fillStyle = color;
				ctx.beginPath();
				ctx.arc(d.x, d.y, 4 * dpr, 0, Math.PI * 2);
				ctx.fill();
			}

			ctx.strokeStyle = color;
			ctx.lineWidth = 2 * dpr;
			ctx.globalAlpha = fade * 0.9;
			ctx.beginPath();
			ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
			ctx.stroke();
			ctx.lineWidth = 1.2 * dpr;
			ctx.globalAlpha = fade * 0.45;
			ctx.beginPath();
			ctx.arc(d.x, d.y, r * 0.55, 0, Math.PI * 2);
			ctx.stroke();
		}
		ctx.globalAlpha = 1;
	}
});
