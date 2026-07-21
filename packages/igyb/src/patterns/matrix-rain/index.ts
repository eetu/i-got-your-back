import { defineCanvas2D } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type MatrixRainOptions = {
	/** Glyph size in CSS pixels. Default `16`. */
	fontSize?: number;
	/** Trail length in glyphs. Default `14`. */
	trail?: number;
};

const GLYPHS = 'ｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓ0123456789'.split('');

/** Deterministic glyph per cell so characters stay put as the column scrolls. */
function hash2(x: number, y: number): number {
	let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
	h = Math.imul(h ^ (h >>> 13), 1274126177);
	return (h ^ (h >>> 16)) >>> 0;
}

type Col = { y: number; speed: number };
type State = { cols: Col[]; w: number; h: number; lineH: number };

/** Cascading glyph columns (a.k.a. "digital rain"). The pointer parts and brightens
 * nearby columns; the head glyph glows in `fg`, the trail fades through `accents[0]`. */
export const matrixRain: BackgroundFactory<MatrixRainOptions> = defineCanvas2D<MatrixRainOptions>({
	defaults: { fontSize: 16, trail: 14 },
	setup(env) {
		const { surface, options } = env;
		const lineH = Math.max(8, (options.fontSize ?? 16) * surface.dpr) * 1.15;
		const count = Math.ceil(surface.width / lineH) + 1;
		const st = env.state.m as State | undefined;
		if (!st || st.w !== surface.width || st.h !== surface.height || st.cols.length !== count) {
			const cols: Col[] = [];
			for (let i = 0; i < count; i++) {
				cols.push({ y: Math.random() * surface.height, speed: 0.6 + Math.random() * 0.9 });
			}
			env.state.m = { cols, w: surface.width, h: surface.height, lineH };
		}
	},
	frame(env) {
		const { ctx, surface, palette, options, pointer, dt } = env;
		const st = (env.state.m ?? { cols: [], w: 0, h: 0, lineH: 18 }) as State;
		const lineH = st.lineH;
		const fontSize = lineH / 1.15;
		const trail = Math.max(2, Math.round(options.trail ?? 14));
		const animating = options.animate !== false;

		ctx.fillStyle = palette.bg;
		ctx.fillRect(0, 0, surface.width, surface.height);
		ctx.font = `${fontSize}px ui-monospace, monospace`;
		ctx.textBaseline = 'top';

		const px = pointer.nx * surface.width;
		const fallPx = lineH * 7;
		const reach = Math.max(surface.width, surface.height) * 0.18;

		for (let i = 0; i < st.cols.length; i++) {
			const col = st.cols[i];
			const x = i * lineH;
			const headRow = Math.floor(col.y / lineH);
			const boost =
				options.interactive && pointer.active ? Math.max(0, 1 - Math.abs(x - px) / reach) : 0;

			for (let k = 0; k < trail; k++) {
				const row = headRow - k;
				const gy = row * lineH;
				if (gy < -lineH || gy > surface.height) continue;
				const ch = GLYPHS[hash2(i, row) % GLYPHS.length];
				if (k === 0) {
					ctx.fillStyle = palette.fg;
					ctx.globalAlpha = 1;
				} else {
					ctx.fillStyle = palette.accent(0);
					ctx.globalAlpha = Math.max(0, 1 - k / trail) * (0.5 + 0.5 * boost);
				}
				ctx.fillText(ch, x, gy);
			}

			if (animating) {
				col.y += col.speed * fallPx * dt * (1 + boost);
				if (headRow * lineH - trail * lineH > surface.height) {
					col.y = -Math.random() * surface.height * 0.5;
					col.speed = 0.6 + Math.random() * 0.9;
				}
			}
		}
		ctx.globalAlpha = 1;
	}
});
