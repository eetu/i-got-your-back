import { flowField, hex, iso, particles, plasma, truchet } from 'i-got-your-back';
import type { BackgroundFactory } from 'i-got-your-back';

export type Param =
  | { key: string; label: string; kind: 'range'; min: number; max: number; step: number }
  | { key: string; label: string; kind: 'select'; choices: string[] };

export type PatternEntry = {
  id: string;
  name: string;
  category: 'Geometric' | 'Generative';
  renderer: 'Canvas2D' | 'WebGL';
  factory: BackgroundFactory<any>;
  defaults: Record<string, unknown>;
  params: Param[];
};

export const patterns: PatternEntry[] = [
  {
    id: 'flowField',
    name: 'Flow Field',
    category: 'Generative',
    renderer: 'WebGL',
    factory: flowField,
    defaults: { scale: 3 },
    params: [{ key: 'scale', label: 'Scale', kind: 'range', min: 1, max: 8, step: 0.5 }],
  },
  {
    id: 'plasma',
    name: 'Plasma',
    category: 'Generative',
    renderer: 'WebGL',
    factory: plasma,
    defaults: { scale: 4 },
    params: [{ key: 'scale', label: 'Scale', kind: 'range', min: 1, max: 10, step: 0.5 }],
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
      { key: 'pointerMode', label: 'Pointer', kind: 'select', choices: ['attract', 'repel'] },
    ],
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
      { key: 'lineWidth', label: 'Line', kind: 'range', min: 2, max: 20, step: 1 },
    ],
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
      { key: 'gap', label: 'Gap', kind: 'range', min: 0, max: 12, step: 1 },
    ],
  },
  {
    id: 'iso',
    name: 'Isometric',
    category: 'Geometric',
    renderer: 'Canvas2D',
    factory: iso,
    defaults: { size: 40 },
    params: [{ key: 'size', label: 'Size', kind: 'range', min: 18, max: 90, step: 2 }],
  },
];

export const themeNames = ['ink', 'neon', 'pastel', 'terminal'] as const;
