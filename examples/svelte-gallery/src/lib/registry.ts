import {
	type AnyBackgroundFactory,
	aurora,
	dotGrid,
	flowField,
	hex,
	iso,
	lowPoly,
	matrixRain,
	metaballs,
	particles,
	plasma,
	starfield,
	type ThemeName,
	truchet,
	voronoi,
	waveLines
} from '@anarkisti/igyb/core';

// A single tweakable option surfaced in the playground: either a numeric range (slider)
// or a fixed set of choices (segmented / select).
export type Param =
	| { key: string; label: string; kind: 'range'; min: number; max: number; step: number }
	| { key: string; label: string; kind: 'select'; choices: string[] };

export type PatternEntry = {
	id: string;
	name: string;
	category: 'Geometric' | 'Generative';
	renderer: 'Canvas2D' | 'WebGL';
	factory: AnyBackgroundFactory;
	defaults: Record<string, unknown>;
	params: Param[];
};

// The shipped patterns, grouped by how they're authored (Generative = WebGL/particle
// systems, Geometric = tiled Canvas2D). Each factory is imported from the tree-shakeable
// `/core` entry, so the playground exercises the exact public surface consumers get.
export const patterns: PatternEntry[] = [
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
	}
];

// Built-in palettes, in showcase order.
export const themeNames = [
	'ink',
	'neon',
	'pastel',
	'terminal',
	'mono',
	'paper',
	'halo'
] as const satisfies readonly ThemeName[];
