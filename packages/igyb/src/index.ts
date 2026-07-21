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

// Themes
export { halo, ink, mono, neon, palettes, paper, pastel, terminal } from './themes/palettes';

// Patterns (each is independently tree-shakeable)
export { aurora, type AuroraOptions } from './patterns/aurora';
export { dotGrid, type DotGridOptions } from './patterns/dot-grid';
export { flowField, type FlowFieldOptions } from './patterns/flow-field';
export { hex, type HexOptions } from './patterns/hex';
export { iso, type IsoOptions } from './patterns/iso';
export { matrixRain, type MatrixRainOptions } from './patterns/matrix-rain';
export { particles, type ParticlesOptions } from './patterns/particles';
export { plasma, type PlasmaOptions } from './patterns/plasma';
export { starfield, type StarfieldOptions } from './patterns/starfield';
export { truchet, type TruchetOptions } from './patterns/truchet';
