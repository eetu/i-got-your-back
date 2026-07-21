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
