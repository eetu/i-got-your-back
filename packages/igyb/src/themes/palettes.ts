import type { Palette, ThemeName } from '../types';

/** Deep indigo ink on near-black — the calm default. */
export const ink: Palette = {
	bg: '#0e0f1a',
	fg: '#e8eaf6',
	accents: ['#5b8def', '#8f5bef', '#4fd1c5', '#ef5b9c']
};

/** High-voltage neon on black. */
export const neon: Palette = {
	bg: '#05010d',
	fg: '#e0f7ff',
	accents: ['#00f5d4', '#f15bb5', '#fee440', '#00bbf9']
};

/** Soft pastels on warm white — a light theme. */
export const pastel: Palette = {
	bg: '#fdf6ff',
	fg: '#5a5266',
	accents: ['#ffb5a7', '#bde0fe', '#caffbf', '#cdb4db']
};

/** Phosphor green on a CRT-dark background. */
export const terminal: Palette = {
	bg: '#001208',
	fg: '#43ff73',
	accents: ['#43ff73', '#12b350', '#8dffab', '#00cc44']
};

/** Plain monochrome on dark — a single grey hue in three values, for a subdued look. */
export const mono: Palette = {
	bg: '#0d0d0f',
	fg: '#f4f4f6',
	accents: ['#e6e6ea', '#a2a2aa', '#5c5c64']
};

/** Monochrome on light — dark neutral marks on off-white paper. */
export const paper: Palette = {
	bg: '#f5f4f2',
	fg: '#1b1a19',
	accents: ['#3a3936', '#7c7a75', '#b9b6b0']
};

/** halo-design brand — a single warm orange in shades on neutral-dark. */
export const halo: Palette = {
	bg: '#141312',
	fg: '#f2f0ec',
	accents: ['#ff7a1a', '#e8630a', '#c25010', '#ffab6b']
};

/** All built-in themes, keyed by name. */
export const palettes: Record<ThemeName, Palette> = {
	ink,
	neon,
	pastel,
	terminal,
	mono,
	paper,
	halo
};
