import { defineCanvas2D } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type StarfieldOptions = {
	/** Number of stars. Default `320`. */
	count?: number;
	/** Warp-speed multiplier. Default `1`. */
	warp?: number;
};

type Star = { x: number; y: number; z: number };
type State = { stars: Star[]; n: number };

function spawn(n: number): State {
	const stars: Star[] = [];
	for (let i = 0; i < n; i++) {
		stars.push({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() });
	}
	return { stars, n };
}

/** Stars streaming out of a vanishing point, with warp streaks. When interactive, the
 * pointer steers the vanishing point so you "fly" toward the cursor. */
export const starfield: BackgroundFactory<StarfieldOptions> = defineCanvas2D<StarfieldOptions>({
	defaults: { count: 320, warp: 1 },
	setup(env) {
		const n = Math.max(40, Math.min(1200, Math.round(env.options.count ?? 320)));
		const st = env.state.s as State | undefined;
		if (!st || st.n !== n) env.state.s = spawn(n);
	},
	frame(env) {
		const { ctx, surface, palette, options, pointer, dt } = env;
		const st = (env.state.s ?? (env.state.s = spawn(320))) as State;
		const dpr = surface.dpr;

		ctx.fillStyle = palette.bg;
		ctx.fillRect(0, 0, surface.width, surface.height);

		const steer = options.interactive === true && pointer.active;
		const cx = surface.width * (steer ? pointer.nx : 0.5);
		const cy = surface.height * (steer ? pointer.ny : 0.5);
		const scale = Math.max(surface.width, surface.height) * 0.5;
		const step = (options.warp ?? 1) * dt * 0.55;
		ctx.lineCap = 'round';

		for (let i = 0; i < st.stars.length; i++) {
			const star = st.stars[i];
			const pz = star.z;
			star.z -= step;
			if (star.z <= 0.02) {
				star.x = Math.random() * 2 - 1;
				star.y = Math.random() * 2 - 1;
				star.z = 1;
				continue;
			}
			const sx = cx + (star.x / star.z) * scale;
			const sy = cy + (star.y / star.z) * scale;
			const ox = cx + (star.x / pz) * scale;
			const oy = cy + (star.y / pz) * scale;
			const b = 1 - star.z;
			const size = Math.max(0.5, b * 2.4 * dpr);
			const color = i % 6 === 0 ? palette.accent(i) : palette.fg;

			ctx.globalAlpha = Math.min(1, 0.2 + b);
			ctx.strokeStyle = color;
			ctx.lineWidth = size;
			ctx.beginPath();
			ctx.moveTo(ox, oy);
			ctx.lineTo(sx, sy);
			ctx.stroke();

			ctx.globalAlpha = Math.min(1, 0.3 + b);
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.arc(sx, sy, size * 0.6, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.globalAlpha = 1;
	}
});
