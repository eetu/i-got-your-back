import { defineCanvas2D } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type RippleOptions = {
	/** Ring expansion speed in CSS px/s. Default `150`. */
	speed?: number;
	/** Ring lifetime in seconds. Default `2.2`. */
	life?: number;
	/** Seconds between rings shed by a held/moving pointer. Default `0.16`. */
	interval?: number;
};

type Drop = { x: number; y: number; age: number; ci: number };

const MAX_DROPS = 200;

/**
 * Concentric water-ripples that emanate from every active pointer/touch point (multitouch),
 * with the odd stray ripple when idle. Enable `interactive` to make it react to touch.
 */
export const ripple: BackgroundFactory<RippleOptions> = defineCanvas2D<RippleOptions>({
	defaults: { speed: 150, life: 2.2, interval: 0.16 },
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

		const life = options.life ?? 2.2;
		const speed = (options.speed ?? 150) * dpr;

		st.acc += dt;
		if (options.interactive && pointer.points.length) {
			if (st.acc >= (options.interval ?? 0.16)) {
				st.acc = 0;
				for (const p of pointer.points) {
					st.drops.push({ x: p.x, y: p.y, age: 0, ci: (Math.random() * 4) | 0 });
				}
			}
		} else {
			st.idle -= dt;
			if (st.idle <= 0) {
				st.idle = 0.8 + Math.random() * 1.6;
				st.drops.push({ x: Math.random() * w, y: Math.random() * h, age: 0, ci: (Math.random() * 4) | 0 });
			}
		}
		if (st.drops.length > MAX_DROPS) st.drops.splice(0, st.drops.length - MAX_DROPS);

		ctx.lineWidth = 1.5 * dpr;
		for (let i = st.drops.length - 1; i >= 0; i--) {
			const d = st.drops[i];
			d.age += dt;
			const k = d.age / life;
			if (k >= 1) {
				st.drops.splice(i, 1);
				continue;
			}
			const r = d.age * speed;
			const fade = (1 - k) * (1 - k);
			ctx.strokeStyle = palette.accent(d.ci);
			ctx.globalAlpha = fade * 0.8;
			ctx.beginPath();
			ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
			ctx.stroke();
			ctx.globalAlpha = fade * 0.35;
			ctx.beginPath();
			ctx.arc(d.x, d.y, r * 0.6, 0, Math.PI * 2);
			ctx.stroke();
		}
		ctx.globalAlpha = 1;
	}
});
