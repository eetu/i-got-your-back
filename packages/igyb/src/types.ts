/** A resolved color palette. All patterns theme themselves from these roles. */
export type Palette = {
	/** Base / background fill. */
	bg: string;
	/** Foreground primary (lines, dominant marks). */
	fg: string;
	/** Ordered accent colors; patterns cycle through as many as they need. */
	accents: string[];
};

/** Names of the built-in themes. */
export type ThemeName = 'ink' | 'neon' | 'pastel' | 'terminal' | 'mono' | 'paper' | 'halo';

/** Either a built-in theme name or a raw palette object. */
export type ThemeInput = ThemeName | Palette;

/** Options every pattern understands, regardless of renderer. */
export type BaseOptions = {
	/**
	 * Built-in theme name, a custom palette, or a thunk returning one. A thunk is re-invoked
	 * by {@link Background.refresh} — use it with `paletteFromCSS` to re-read CSS-var themes on
	 * a light/dark flip without recreating the background. Default `'ink'`.
	 */
	theme?: ThemeInput | (() => ThemeInput);
	/** Animate on a RAF loop. Default `true`. */
	animate?: boolean;
	/** Time multiplier for animation. Default `1`. */
	speed?: number;
	/** React to pointer input. Default `false`. */
	interactive?: boolean;
	/**
	 * Where interactive patterns read the pointer from. `'window'` tracks it globally —
	 * use it when the canvas is behind `pointer-events: none` (a full-page background).
	 * Default `'element'`.
	 */
	pointerSource?: 'element' | 'window';
	/** How to treat `prefers-reduced-motion`. `'respect'` freezes to a static frame. Default `'respect'`. */
	reducedMotion?: 'respect' | 'off';
	/** Device-pixel-ratio override. Defaults to `min(devicePixelRatio, 2)`. */
	dpr?: number;
};

/** A running background instance. */
export type Background = {
	/** Start (or resume) the render loop. */
	start(): void;
	/** Pause the render loop. */
	stop(): void;
	/** Update options in place (theme, params, animate…) without re-creating. */
	update(options: Partial<BaseOptions> & Record<string, unknown>): void;
	/** Force a re-measure of the host element. Normally automatic via ResizeObserver. */
	resize(): void;
	/** Re-resolve the theme (re-invoking a `theme` thunk) and repaint — for CSS-var palettes after a theme flip. */
	refresh(): void;
	/** Tear down: stop the loop, drop listeners, remove the canvas. */
	destroy(): void;
};

/**
 * A pattern. Call it with a host element to mount a {@link Background}.
 * `O` is the pattern's own option shape, merged on top of {@link BaseOptions}.
 */
export type BackgroundFactory<O = Record<string, never>> = (
	target: HTMLElement,
	options?: Partial<O & BaseOptions>
) => Background;

/**
 * A {@link BackgroundFactory} with its option type erased — for hosts (framework
 * wrappers, pattern registries) that accept heterogeneous patterns and don't know
 * each one's option shape.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- deliberate erasure: a generic host accepts any pattern regardless of its options type
export type AnyBackgroundFactory = BackgroundFactory<any>;
