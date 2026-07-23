// Public types
export type {
	AnyBackgroundFactory,
	Background,
	BackgroundFactory,
	BaseOptions,
	Palette,
	ThemeInput,
	ThemeName
} from './types';

// Authoring helpers — build your own patterns
export type { Canvas2DEnv, WebGLEnv } from './runtime/define';
export { defineCanvas2D, defineWebGL } from './runtime/define';
export type { PatternEnv } from './runtime/mount';
export type { Scroll } from './runtime/scroll';

// Compositor — stack patterns into one background
export { type Layer, layers } from './runtime/layers';

// Color helpers — for drawing your own glyphs/marks against a themed palette
export { darken, lighten, mix, toRgb, toRgbString } from './runtime/color';

// Themes
export { type CSSVarMap, paletteFromCSS, type ResolvedPalette } from './runtime/theme';
export {
	cyberpunk,
	forest,
	halo,
	ink,
	mono,
	neon,
	ocean,
	palettes,
	paper,
	pastel,
	sunset,
	terminal
} from './themes/palettes';

// Patterns (each is independently tree-shakeable)
export { aurora, type AuroraOptions } from './patterns/aurora';
export { dotGrid, type DotGridOptions } from './patterns/dot-grid';
export { flowField, type FlowFieldOptions } from './patterns/flow-field';
export {
	type Glyph,
	type GlyphDraw,
	type GlyphEnv,
	glyphTile,
	type GlyphTileOptions
} from './patterns/glyph-tile';
export { gradientMesh, type GradientMeshOptions } from './patterns/gradient-mesh';
export { grain, type GrainOptions } from './patterns/grain';
export { hex, type HexOptions } from './patterns/hex';
export { iso, type IsoOptions } from './patterns/iso';
export { lowPoly, type LowPolyOptions } from './patterns/low-poly';
export { matrixRain, type MatrixRainOptions } from './patterns/matrix-rain';
export { metaballs, type MetaballsOptions } from './patterns/metaballs';
export { particles, type ParticlesOptions } from './patterns/particles';
export { plasma, type PlasmaOptions } from './patterns/plasma';
export { ripple, type RippleOptions } from './patterns/ripple';
export { scanlines, type ScanlinesOptions } from './patterns/scanlines';
export { spotlight, type SpotlightOptions } from './patterns/spotlight';
export { starfield, type StarfieldOptions } from './patterns/starfield';
export { truchet, type TruchetOptions } from './patterns/truchet';
export { vignette, type VignetteOptions } from './patterns/vignette';
export { voronoi, type VoronoiOptions } from './patterns/voronoi';
export { waveLines, type WaveLinesOptions } from './patterns/wave-lines';
