import { palettes } from '../themes/palettes';
import type { Palette, ThemeInput, ThemeName } from '../types';

/** A palette plus a convenience accessor that wraps the accent list. */
export type ResolvedPalette = Palette & {
	/** Accent color at index `i`, wrapping around the list. */
	accent(i: number): string;
};

/** Resolve a theme name or raw palette into a {@link ResolvedPalette}. */
export function resolveTheme(input: ThemeInput | undefined): ResolvedPalette {
	const base: Palette =
		typeof input === 'string'
			? (palettes[input as ThemeName] ?? palettes.ink)
			: (input ?? palettes.ink);

	const accents = base.accents.length > 0 ? base.accents : ['#ffffff'];

	return {
		...base,
		accents,
		accent(i: number): string {
			return accents[((i % accents.length) + accents.length) % accents.length];
		}
	};
}

/** Maps {@link Palette} roles to CSS custom-property names, e.g. `{ bg: '--halo-body' }`. */
export type CSSVarMap = {
	/** CSS var supplying {@link Palette.bg}. */
	bg: string;
	/** CSS var supplying {@link Palette.fg}. */
	fg: string;
	/** CSS vars supplying {@link Palette.accents}. Defaults to `[fg]`. */
	accents?: string[];
};

/**
 * Read a {@link Palette} from CSS custom properties on `el` (default `<html>`). Pair it with
 * a `theme` thunk + {@link Background.refresh} so a token-driven app re-themes its background
 * on a light/dark flip without tearing it down. Call it *after* the new tokens have landed on
 * the element (e.g. after the `data-theme` write) so it reads the current values, not stale ones.
 */
export function paletteFromCSS(map: CSSVarMap, el?: HTMLElement): Palette {
	const root = el ?? document.documentElement;
	const s = getComputedStyle(root);
	const read = (v: string, fallback: string): string => s.getPropertyValue(v).trim() || fallback;
	const fg = read(map.fg, '#ffffff');
	return {
		bg: read(map.bg, '#000000'),
		fg,
		accents: (map.accents ?? [map.fg]).map((v) => read(v, fg))
	};
}
