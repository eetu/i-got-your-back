// An optional, opt-in catalogue of the built-in patterns with light metadata — enough to
// build a gallery, a "randomize" button, or auto-generated controls without hand-maintaining
// a list. Import from `@anarkisti/igyb/registry`; it pulls every pattern, so reach for the
// tree-shakeable `/core` (or a `/patterns/*` deep import) when you only need one.
import { aurora } from './patterns/aurora';
import { dotGrid } from './patterns/dot-grid';
import { flowField } from './patterns/flow-field';
import { glyphTile } from './patterns/glyph-tile';
import { gradientMesh } from './patterns/gradient-mesh';
import { grain } from './patterns/grain';
import { hex } from './patterns/hex';
import { iso } from './patterns/iso';
import { lowPoly } from './patterns/low-poly';
import { matrixRain } from './patterns/matrix-rain';
import { metaballs } from './patterns/metaballs';
import { particles } from './patterns/particles';
import { plasma } from './patterns/plasma';
import { ripple } from './patterns/ripple';
import { scanlines } from './patterns/scanlines';
import { spotlight } from './patterns/spotlight';
import { starfield } from './patterns/starfield';
import { truchet } from './patterns/truchet';
import { vignette } from './patterns/vignette';
import { voronoi } from './patterns/voronoi';
import { waveLines } from './patterns/wave-lines';
import type { AnyBackgroundFactory, ThemeName } from './types';

/** A single tweakable option, for auto-generated controls: a numeric range or a fixed choice. */
export type PatternParam =
	| { key: string; label: string; kind: 'range'; min: number; max: number; step: number }
	| { key: string; label: string; kind: 'select'; choices: string[] };

/** Metadata describing one built-in pattern. */
export type PatternMeta = {
	id: string;
	name: string;
	category: 'Geometric' | 'Generative';
	renderer: 'Canvas2D' | 'WebGL';
	factory: AnyBackgroundFactory;
	/** Recommended default options. */
	defaults: Record<string, unknown>;
	/** Tweakable params surfaced by a playground / control panel. */
	params: PatternParam[];
};

/** The standalone, full-screen patterns — the gallery set. */
export const patterns: PatternMeta[] = [
	{
		id: 'flowField',
		name: 'Flow Field',
		category: 'Generative',
		renderer: 'WebGL',
		factory: flowField,
		defaults: { scale: 1.8 },
		params: [{ key: 'scale', label: 'Scale', kind: 'range', min: 0.8, max: 4, step: 0.2 }]
	},
	{
		id: 'plasma',
		name: 'Plasma',
		category: 'Generative',
		renderer: 'WebGL',
		factory: plasma,
		defaults: { scale: 3.5 },
		params: [{ key: 'scale', label: 'Scale', kind: 'range', min: 1.5, max: 7, step: 0.5 }]
	},
	{
		id: 'gradientMesh',
		name: 'Gradient Mesh',
		category: 'Generative',
		renderer: 'WebGL',
		factory: gradientMesh,
		defaults: { scale: 1.2 },
		params: [{ key: 'scale', label: 'Scale', kind: 'range', min: 0.6, max: 3, step: 0.1 }]
	},
	{
		id: 'aurora',
		name: 'Aurora',
		category: 'Generative',
		renderer: 'WebGL',
		factory: aurora,
		defaults: { scale: 1.5 },
		params: [{ key: 'scale', label: 'Scale', kind: 'range', min: 0.8, max: 4, step: 0.2 }]
	},
	{
		id: 'metaballs',
		name: 'Metaballs',
		category: 'Generative',
		renderer: 'WebGL',
		factory: metaballs,
		defaults: { size: 1 },
		params: [{ key: 'size', label: 'Size', kind: 'range', min: 0.6, max: 1.6, step: 0.1 }]
	},
	{
		id: 'voronoi',
		name: 'Voronoi',
		category: 'Generative',
		renderer: 'WebGL',
		factory: voronoi,
		defaults: { scale: 5 },
		params: [{ key: 'scale', label: 'Cells', kind: 'range', min: 3, max: 12, step: 1 }]
	},
	{
		id: 'particles',
		name: 'Particles',
		category: 'Generative',
		renderer: 'Canvas2D',
		factory: particles,
		defaults: { spacing: 110, linkDistance: 130, pointerMode: 'attract' },
		params: [
			{ key: 'spacing', label: 'Spacing', kind: 'range', min: 60, max: 200, step: 5 },
			{ key: 'linkDistance', label: 'Link', kind: 'range', min: 60, max: 220, step: 5 },
			{ key: 'pointerMode', label: 'Pointer', kind: 'select', choices: ['attract', 'repel'] }
		]
	},
	{
		id: 'ripple',
		name: 'Ripple',
		category: 'Generative',
		renderer: 'Canvas2D',
		factory: ripple,
		defaults: { expand: 160, life: 2.4 },
		params: [
			{ key: 'expand', label: 'Speed', kind: 'range', min: 60, max: 320, step: 10 },
			{ key: 'life', label: 'Life', kind: 'range', min: 1, max: 4, step: 0.2 }
		]
	},
	{
		id: 'matrixRain',
		name: 'Matrix Rain',
		category: 'Generative',
		renderer: 'Canvas2D',
		factory: matrixRain,
		defaults: { fontSize: 16, trail: 14 },
		params: [
			{ key: 'fontSize', label: 'Glyph', kind: 'range', min: 10, max: 32, step: 1 },
			{ key: 'trail', label: 'Trail', kind: 'range', min: 6, max: 24, step: 1 }
		]
	},
	{
		id: 'starfield',
		name: 'Starfield',
		category: 'Generative',
		renderer: 'Canvas2D',
		factory: starfield,
		defaults: { count: 700, warp: 1 },
		params: [
			{ key: 'count', label: 'Stars', kind: 'range', min: 120, max: 1200, step: 20 },
			{ key: 'warp', label: 'Warp', kind: 'range', min: 0.3, max: 3, step: 0.1 }
		]
	},
	{
		id: 'truchet',
		name: 'Truchet',
		category: 'Geometric',
		renderer: 'Canvas2D',
		factory: truchet,
		defaults: { tile: 52, lineWidth: 7 },
		params: [
			{ key: 'tile', label: 'Tile', kind: 'range', min: 24, max: 120, step: 2 },
			{ key: 'lineWidth', label: 'Line', kind: 'range', min: 2, max: 20, step: 1 }
		]
	},
	{
		id: 'hex',
		name: 'Hex',
		category: 'Geometric',
		renderer: 'Canvas2D',
		factory: hex,
		defaults: { radius: 34, gap: 3 },
		params: [
			{ key: 'radius', label: 'Radius', kind: 'range', min: 12, max: 70, step: 2 },
			{ key: 'gap', label: 'Gap', kind: 'range', min: 0, max: 12, step: 1 }
		]
	},
	{
		id: 'iso',
		name: 'Isometric',
		category: 'Geometric',
		renderer: 'Canvas2D',
		factory: iso,
		defaults: { size: 40 },
		params: [{ key: 'size', label: 'Size', kind: 'range', min: 18, max: 90, step: 2 }]
	},
	{
		id: 'dotGrid',
		name: 'Dot Grid',
		category: 'Geometric',
		renderer: 'Canvas2D',
		factory: dotGrid,
		defaults: { spacing: 34, dotSize: 3 },
		params: [
			{ key: 'spacing', label: 'Spacing', kind: 'range', min: 18, max: 70, step: 2 },
			{ key: 'dotSize', label: 'Dot', kind: 'range', min: 1, max: 8, step: 0.5 }
		]
	},
	{
		id: 'waveLines',
		name: 'Wave Lines',
		category: 'Geometric',
		renderer: 'Canvas2D',
		factory: waveLines,
		defaults: { spacing: 26, amplitude: 1 },
		params: [
			{ key: 'spacing', label: 'Spacing', kind: 'range', min: 14, max: 60, step: 2 },
			{ key: 'amplitude', label: 'Amp', kind: 'range', min: 0.3, max: 2, step: 0.1 }
		]
	},
	{
		id: 'lowPoly',
		name: 'Low Poly',
		category: 'Geometric',
		renderer: 'Canvas2D',
		factory: lowPoly,
		defaults: { cell: 72 },
		params: [{ key: 'cell', label: 'Cell', kind: 'range', min: 40, max: 140, step: 5 }]
	},
	{
		id: 'glyphTile',
		name: 'Glyph Tile',
		category: 'Geometric',
		renderer: 'Canvas2D',
		factory: glyphTile,
		defaults: { glyph: ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'], size: 48, layout: 'grid', jitterRotate: 0 },
		params: [
			{ key: 'size', label: 'Size', kind: 'range', min: 24, max: 96, step: 4 },
			{ key: 'layout', label: 'Layout', kind: 'select', choices: ['grid', 'brick'] },
			{ key: 'jitterRotate', label: 'Rotate', kind: 'range', min: 0, max: 45, step: 1 }
		]
	}
];

/** Transparent overlay passes, meant to be composed over other patterns via `layers`. */
export const overlays: PatternMeta[] = [
	{
		id: 'grain',
		name: 'Grain',
		category: 'Generative',
		renderer: 'Canvas2D',
		factory: grain,
		defaults: { intensity: 0.08, scale: 1.5 },
		params: [{ key: 'intensity', label: 'Amount', kind: 'range', min: 0, max: 0.3, step: 0.01 }]
	},
	{
		id: 'vignette',
		name: 'Vignette',
		category: 'Generative',
		renderer: 'Canvas2D',
		factory: vignette,
		defaults: { intensity: 0.55, inner: 0.45 },
		params: [{ key: 'intensity', label: 'Amount', kind: 'range', min: 0, max: 1, step: 0.05 }]
	},
	{
		id: 'scanlines',
		name: 'Scanlines',
		category: 'Generative',
		renderer: 'Canvas2D',
		factory: scanlines,
		defaults: { spacing: 4, intensity: 0.22 },
		params: [{ key: 'spacing', label: 'Spacing', kind: 'range', min: 2, max: 12, step: 1 }]
	},
	{
		id: 'spotlight',
		name: 'Spotlight',
		category: 'Generative',
		renderer: 'Canvas2D',
		factory: spotlight,
		defaults: { radius: 200, dim: 0.72 },
		params: [{ key: 'radius', label: 'Radius', kind: 'range', min: 80, max: 400, step: 10 }]
	}
];

/** Look up a pattern or overlay by its `id`. */
export function patternById(id: string): PatternMeta | undefined {
	return patterns.find((p) => p.id === id) ?? overlays.find((p) => p.id === id);
}

/** All built-in theme names, in showcase order. */
export const themeNames = [
	'ink',
	'neon',
	'pastel',
	'terminal',
	'mono',
	'paper',
	'halo',
	'sunset',
	'ocean',
	'cyberpunk',
	'forest'
] as const satisfies readonly ThemeName[];
