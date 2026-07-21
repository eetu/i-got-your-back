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
export { ink, neon, palettes, pastel, terminal } from './themes/palettes';

// Patterns (each is independently tree-shakeable)
export { flowField, type FlowFieldOptions } from './patterns/flow-field';
export { hex, type HexOptions } from './patterns/hex';
export { iso, type IsoOptions } from './patterns/iso';
export { particles, type ParticlesOptions } from './patterns/particles';
export { plasma, type PlasmaOptions } from './patterns/plasma';
export { truchet, type TruchetOptions } from './patterns/truchet';
