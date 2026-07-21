import type { BackgroundFactory } from '../types';
import { mount, type PatternEnv } from './mount';

/** Pattern env narrowed for a Canvas2D renderer (`ctx` guaranteed). */
export type Canvas2DEnv<O> = Omit<PatternEnv<O>, 'ctx' | 'gl'> & {
	ctx: CanvasRenderingContext2D;
};

/** Pattern env narrowed for a WebGL2 renderer (`gl` guaranteed). */
export type WebGLEnv<O> = Omit<PatternEnv<O>, 'ctx' | 'gl'> & {
	gl: WebGL2RenderingContext;
};

export type Canvas2DSpec<O> = {
	defaults: O;
	setup?(env: Canvas2DEnv<O>): void;
	frame(env: Canvas2DEnv<O>): void;
};

export type WebGLSpec<O> = {
	defaults: O;
	setup?(env: WebGLEnv<O>): void;
	frame(env: WebGLEnv<O>): void;
};

/** Author a Canvas2D pattern. Returns a ready-to-use {@link BackgroundFactory}. */
export function defineCanvas2D<O extends object>(spec: Canvas2DSpec<O>): BackgroundFactory<O> {
	return (target, options) =>
		mount<O>(
			target,
			{
				contextKind: '2d',
				defaults: spec.defaults,
				setup: spec.setup as ((env: PatternEnv<O>) => void) | undefined,
				frame: spec.frame as (env: PatternEnv<O>) => void
			},
			options
		);
}

/** Author a WebGL2 pattern. Returns a ready-to-use {@link BackgroundFactory}. */
export function defineWebGL<O extends object>(spec: WebGLSpec<O>): BackgroundFactory<O> {
	return (target, options) =>
		mount<O>(
			target,
			{
				contextKind: 'webgl2',
				defaults: spec.defaults,
				setup: spec.setup as ((env: PatternEnv<O>) => void) | undefined,
				frame: spec.frame as (env: PatternEnv<O>) => void
			},
			options
		);
}
