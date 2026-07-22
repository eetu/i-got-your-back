import { defineCanvas2D } from '../../runtime/define';
import type { ResolvedPalette } from '../../runtime/theme';
import type { BackgroundFactory } from '../../types';

/** Per-cell drawing context passed to a {@link GlyphDraw}. */
export type GlyphEnv = {
	/** Accumulated, speed-scaled animation time in seconds. */
	time: number;
	/** Pointer proximity for this cell: 0 (far, or not interactive) … 1 (at the pointer). */
	highlight: number;
	/** Resolved theme palette — read `fg`/`bg`/`accent(index)` to colour a custom glyph. */
	palette: ResolvedPalette;
};

/**
 * Draws one glyph, centred at the current canvas origin, within a `size`×`size` box.
 * `fillStyle`/`strokeStyle` are pre-set to the cell's themed colour. `index` is a stable
 * per-cell number (vary what you draw, e.g. a die face); `env` carries the animation
 * `time` and a per-cell pointer `highlight` (0…1) for reactive glyphs.
 */
export type GlyphDraw = (
	ctx: CanvasRenderingContext2D,
	size: number,
	index: number,
	env: GlyphEnv
) => void;

/** A single glyph: either text (rendered centred) or a {@link GlyphDraw} callback. */
export type Glyph = string | GlyphDraw;

export type GlyphTileOptions = {
	/** The glyph(s) to tile. An array is spread across cells by a deterministic hash. */
	glyph?: Glyph | Glyph[];
	/** Cell box size in CSS pixels. Default `44`. */
	size?: number;
	/** Tiling arrangement. Default `'grid'`. */
	layout?: 'grid' | 'brick';
	/** Per-cell rotation spread in degrees. Default `0`. */
	jitterRotate?: number;
};

const DEFAULT_GLYPH: GlyphDraw = (ctx, size) => {
	ctx.beginPath();
	ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
	ctx.fill();
};

function hash2(x: number, y: number): number {
	let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
	h = Math.imul(h ^ (h >>> 13), 1274126177);
	return (h ^ (h >>> 16)) >>> 0;
}

function normalize(glyph: Glyph | Glyph[] | undefined): Glyph[] {
	if (glyph == null) return [DEFAULT_GLYPH];
	if (Array.isArray(glyph)) return glyph.length > 0 ? glyph : [DEFAULT_GLYPH];
	return [glyph];
}

/**
 * Tiles a caller-supplied glyph (text or a draw callback) across a themed grid — a
 * repeating "logo/icon field". Pass unicode (e.g. dice faces `⚀–⚅`), an emoji, or a
 * `GlyphDraw` for full vector control; an array varies glyphs per cell.
 */
export const glyphTile: BackgroundFactory<GlyphTileOptions> = defineCanvas2D<GlyphTileOptions>({
	defaults: { size: 44, layout: 'grid', jitterRotate: 0 },
	frame(env) {
		const { ctx, surface, palette, options, pointer, time } = env;
		const dpr = surface.dpr;
		const box = Math.max(12, (options.size ?? 44) * dpr);
		const glyphs = normalize(options.glyph);
		const brick = options.layout === 'brick';
		const jitter = ((options.jitterRotate ?? 0) * Math.PI) / 180;
		const animating = options.animate !== false;

		ctx.fillStyle = palette.bg;
		ctx.fillRect(0, 0, surface.width, surface.height);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		const font = `${Math.round(box * 0.72)}px ui-sans-serif, system-ui, sans-serif`;

		const cols = Math.ceil(surface.width / box) + 1;
		const rows = Math.ceil(surface.height / box) + 1;
		const px = pointer.nx * surface.width;
		const py = pointer.ny * surface.height;
		const reach = Math.max(surface.width, surface.height) * 0.25;

		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				const h = hash2(col, row);
				const g = glyphs[h % glyphs.length];
				const cx = col * box + box / 2 + (brick && row % 2 ? box / 2 : 0);
				const cy = row * box + box / 2;

				const highlight =
					options.interactive && pointer.active
						? Math.max(0, 1 - Math.hypot(cx - px, cy - py) / reach)
						: 0;

				let scale = 1;
				let alpha = 1;
				if (animating) {
					const w = 0.5 + 0.5 * Math.sin((col + row) * 0.5 - time * 0.8);
					scale = 0.9 + 0.12 * w;
					alpha = 0.72 + 0.28 * w;
				}
				scale += highlight * 0.28;
				alpha = Math.min(1, alpha + highlight * 0.4);
				const rot = jitter ? (h / 0xffffffff - 0.5) * 2 * jitter : 0;

				ctx.save();
				ctx.translate(cx, cy);
				if (rot) ctx.rotate(rot);
				if (scale !== 1) ctx.scale(scale, scale);
				ctx.globalAlpha = alpha;
				const color = palette.accent(h);
				ctx.fillStyle = color;
				ctx.strokeStyle = color;
				if (typeof g === 'string') {
					ctx.font = font;
					ctx.fillText(g, 0, 0);
				} else {
					g(ctx, box, h, { time, highlight, palette });
				}
				ctx.restore();
			}
		}
		ctx.globalAlpha = 1;
	}
});
