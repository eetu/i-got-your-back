import { mixHex } from '../../runtime/color';
import { type Canvas2DEnv, defineCanvas2D } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type LowPolyOptions = {
	/** Triangle cell size in CSS pixels. Default `72`. */
	cell?: number;
};

type Pt = { bx: number; by: number; ph: number; x: number; y: number };
type State = { pts: Pt[]; stride: number; rows: number; w: number; h: number; cell: number };

/** Interpolate across the palette's accents by `t` (0..1). */
function ramp(accents: string[], t: number): string {
	const n = accents.length;
	if (n === 1) return accents[0];
	const s = Math.min(0.9999, Math.max(0, t)) * (n - 1);
	const i = Math.floor(s);
	return mixHex(accents[i], accents[i + 1], s - i);
}

function build(env: Canvas2DEnv<LowPolyOptions>): State {
	const { surface, options } = env;
	const cell = Math.max(24, (options.cell ?? 72) * surface.dpr);
	const cols = Math.ceil(surface.width / cell) + 2; // extend past the edges so jitter never gaps
	const rows = Math.ceil(surface.height / cell) + 2;
	const stride = cols + 1;
	const pts: Pt[] = [];
	for (let j = 0; j <= rows; j++) {
		for (let i = 0; i <= cols; i++) {
			const bx = (i - 1) * cell + (Math.random() - 0.5) * cell * 0.7;
			const by = (j - 1) * cell + (Math.random() - 0.5) * cell * 0.7;
			pts.push({ bx, by, ph: Math.random() * Math.PI * 2, x: bx, y: by });
		}
	}
	return { pts, stride, rows, w: surface.width, h: surface.height, cell };
}

/** Triangulated gradient mesh (low-poly). Vertices drift; the pointer pushes them. */
export const lowPoly: BackgroundFactory<LowPolyOptions> = defineCanvas2D<LowPolyOptions>({
	defaults: { cell: 72 },
	setup(env) {
		const st = env.state.g as State | undefined;
		const cell = Math.max(24, (env.options.cell ?? 72) * env.surface.dpr);
		if (!st || st.w !== env.surface.width || st.h !== env.surface.height || st.cell !== cell) {
			env.state.g = build(env);
		}
	},
	frame(env) {
		const { ctx, surface, palette, options, pointer, time } = env;
		const st = (env.state.g ?? (env.state.g = build(env))) as State;
		const { pts, stride, rows, cell } = st;
		const cols = stride - 1;
		const animating = options.animate !== false;
		const accents = palette.accents;

		ctx.fillStyle = palette.bg;
		ctx.fillRect(0, 0, surface.width, surface.height);

		const px = pointer.nx * surface.width;
		const py = pointer.ny * surface.height;
		const drift = animating ? cell * 0.12 : 0;
		const reach = surface.width * 0.22;
		const reach2 = reach * reach;

		for (const p of pts) {
			p.x = p.bx + Math.sin(time * 0.5 + p.ph) * drift;
			p.y = p.by + Math.cos(time * 0.4 + p.ph) * drift;
			if (options.interactive && pointer.active) {
				const dx = p.x - px;
				const dy = p.y - py;
				const d2 = dx * dx + dy * dy;
				if (d2 < reach2 && d2 > 1) {
					const f = ((1 - d2 / reach2) * cell * 0.4) / Math.sqrt(d2);
					p.x += dx * f;
					p.y += dy * f;
				}
			}
		}

		const at = (i: number, j: number): Pt => pts[j * stride + i];
		const tri = (a: Pt, b: Pt, c: Pt): void => {
			const cx = (a.x + b.x + c.x) / 3;
			const cy = (a.y + b.y + c.y) / 3;
			const h = Math.min(
				1,
				Math.max(
					0,
					(cx / surface.width) * 0.6 +
						(cy / surface.height) * 0.4 +
						0.14 * Math.sin(cx * 0.008 - cy * 0.006 + (animating ? time * 0.3 : 0))
				)
			);
			const fill = ramp(accents, h);
			ctx.fillStyle = fill;
			ctx.strokeStyle = fill; // 1px same-colour stroke hides anti-alias seams
			ctx.beginPath();
			ctx.moveTo(a.x, a.y);
			ctx.lineTo(b.x, b.y);
			ctx.lineTo(c.x, c.y);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		};

		ctx.lineWidth = 1;
		for (let j = 0; j < rows; j++) {
			for (let i = 0; i < cols; i++) {
				const a = at(i, j);
				const b = at(i + 1, j);
				const c = at(i + 1, j + 1);
				const d = at(i, j + 1);
				tri(a, b, c);
				tri(a, c, d);
			}
		}
	}
});
