import type { Background, BaseOptions, ThemeInput } from '../types';
import { createLoop } from './loop';
import { prefersReducedMotion } from './motion';
import { createPointer, type Pointer } from './pointer';
import { createSurface, type Surface } from './surface';
import { type ResolvedPalette, resolveTheme } from './theme';

/** Everything a pattern's `setup`/`frame` callbacks receive. */
export type PatternEnv<O> = {
	readonly surface: Surface;
	/** Present when the pattern's renderer is `canvas2d`. */
	readonly ctx: CanvasRenderingContext2D | null;
	/** Present when the pattern's renderer is `webgl2`. */
	readonly gl: WebGL2RenderingContext | null;
	/** Accumulated, speed-scaled time in seconds. */
	time: number;
	/** Speed-scaled delta since the previous frame, in seconds. */
	dt: number;
	palette: ResolvedPalette;
	readonly pointer: Pointer;
	options: O & BaseOptions;
	/** Per-instance scratch space for cached resources (GL programs, grids…). */
	state: Record<string, unknown>;
};

export type MountSpec<O> = {
	contextKind: '2d' | 'webgl2';
	defaults: O;
	/** Rebuild resources — runs on init, on resize, and after `update`. Keep it idempotent. */
	setup?(env: PatternEnv<O>): void;
	frame(env: PatternEnv<O>): void;
};

const BASE_DEFAULTS: Required<Omit<BaseOptions, 'dpr'>> & { theme: ThemeInput } = {
	theme: 'ink',
	animate: true,
	speed: 1,
	interactive: false,
	pointerSource: 'element',
	reducedMotion: 'respect'
};

/** Resolve a `theme` option, unwrapping a thunk (used for CSS-var palettes). */
function resolveThemeOption(theme: BaseOptions['theme']): ResolvedPalette {
	return resolveTheme(typeof theme === 'function' ? theme() : theme);
}

function mount<O extends object>(
	target: HTMLElement,
	spec: MountSpec<O>,
	options?: Partial<O & BaseOptions>
): Background {
	const opts = { ...BASE_DEFAULTS, ...spec.defaults, ...options } as O & BaseOptions;

	const surfaceCtl = createSurface(target, opts.dpr);
	const { surface } = surfaceCtl;

	let ctx: CanvasRenderingContext2D | null = null;
	let gl: WebGL2RenderingContext | null = null;
	if (spec.contextKind === '2d') {
		ctx = surface.canvas.getContext('2d');
		if (!ctx) throw new Error('[igyb] 2D canvas context unavailable');
	} else {
		gl = surface.canvas.getContext('webgl2', { antialias: true, premultipliedAlpha: false });
		if (!gl) throw new Error('[igyb] WebGL2 context unavailable');
	}

	const pointerCtl = createPointer(surface.canvas, opts.pointerSource);
	let pointerAttached = false;

	const env: PatternEnv<O> = {
		surface,
		ctx,
		gl,
		time: 0,
		dt: 0,
		palette: resolveThemeOption(opts.theme),
		pointer: pointerCtl.pointer,
		options: opts,
		state: {}
	};

	const loop = createLoop((dt) => {
		env.dt = dt * (env.options.speed ?? 1);
		env.time += env.dt;
		spec.frame(env);
	});

	let started = false;

	function motionAllowsAnimation(): boolean {
		if (env.options.animate === false) return false;
		if (env.options.reducedMotion !== 'off' && prefersReducedMotion()) return false;
		return true;
	}

	function renderOnce(): void {
		env.dt = 0;
		spec.frame(env);
	}

	function reconfigure(): void {
		if (gl) gl.viewport(0, 0, surface.width, surface.height);
		spec.setup?.(env);
	}

	function syncPointer(): void {
		const want = env.options.interactive === true;
		if (want && !pointerAttached) {
			pointerCtl.attach();
			pointerAttached = true;
		} else if (!want && pointerAttached) {
			pointerCtl.detach();
			pointerAttached = false;
		}
	}

	// Initial layout + resources.
	surfaceCtl.measure();
	reconfigure();
	syncPointer();

	surfaceCtl.observe(() => {
		reconfigure();
		if (!loop.running) renderOnce();
	});

	function start(): void {
		started = true;
		if (motionAllowsAnimation()) {
			loop.start();
		} else {
			loop.stop();
			renderOnce();
		}
	}

	function stop(): void {
		started = false;
		loop.stop();
	}

	function update(next: Partial<O & BaseOptions>): void {
		const themeChanged = 'theme' in next;
		Object.assign(env.options as object, next);
		if (themeChanged) env.palette = resolveThemeOption(env.options.theme);
		if ('interactive' in next) syncPointer();
		if ('dpr' in next) surfaceCtl.measure();
		reconfigure();
		if (started) start();
		else renderOnce();
	}

	function resize(): void {
		surfaceCtl.measure();
		reconfigure();
		if (!loop.running) renderOnce();
	}

	function refresh(): void {
		env.palette = resolveThemeOption(env.options.theme);
		reconfigure();
		if (!loop.running) renderOnce();
	}

	function destroy(): void {
		loop.stop();
		pointerCtl.detach();
		surfaceCtl.destroy();
		if (gl) gl.getExtension('WEBGL_lose_context')?.loseContext();
	}

	return { start, stop, update, resize, refresh, destroy };
}

export { mount };
