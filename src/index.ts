// Public types
export type {
  Background,
  BackgroundFactory,
  BaseOptions,
  Palette,
  ThemeInput,
  ThemeName,
} from './types';

// Authoring helpers — build your own patterns
export { defineCanvas2D, defineWebGL } from './runtime/define';
export type { Canvas2DEnv, WebGLEnv } from './runtime/define';
export type { PatternEnv } from './runtime/mount';

// Themes
export { ink, neon, pastel, terminal, palettes } from './themes/palettes';

// Patterns (each is independently tree-shakeable)
export { truchet, type TruchetOptions } from './patterns/truchet';
export { hex, type HexOptions } from './patterns/hex';
export { iso, type IsoOptions } from './patterns/iso';
export { particles, type ParticlesOptions } from './patterns/particles';
export { flowField, type FlowFieldOptions } from './patterns/flow-field';
export { plasma, type PlasmaOptions } from './patterns/plasma';
