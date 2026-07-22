import type { AnyBackgroundFactory, BaseOptions } from '../types';

/** One layer in a {@link layers} stack. */
export type Layer = {
	/** The pattern factory to mount for this layer. */
	pattern: AnyBackgroundFactory;
	/** Options for this layer, merged over the stack's shared options. */
	options?: Partial<BaseOptions> & Record<string, unknown>;
	/** CSS opacity for this layer (0–1). Default `1`. */
	opacity?: number;
	/** CSS `mix-blend-mode` for compositing over the layers below (e.g. `'screen'`, `'overlay'`). */
	blend?: string;
};

/**
 * Compose several patterns into one background by stacking them on separate canvases with
 * CSS opacity + `mix-blend-mode`. Because each layer keeps its own canvas, WebGL and Canvas2D
 * patterns mix freely — e.g. an `aurora` base with `particles` screened on top and a `grain`
 * overlay. Returns a factory, so it drops into `<Background pattern={…}>` or `layers(…)(el)`.
 *
 * Options passed at mount (and the optional `shared` base) flow into every layer, so
 * `bg.update({ theme })` re-themes the whole stack at once.
 */
export function layers(
	defs: Layer[],
	shared: Partial<BaseOptions> & Record<string, unknown> = {}
): AnyBackgroundFactory {
	return (target, options) => {
		const base = { ...shared, ...options };
		if (getComputedStyle(target).position === 'static') target.style.position = 'relative';

		const container = document.createElement('div');
		container.style.cssText = 'position:absolute;inset:0;overflow:hidden;';
		target.appendChild(container);

		const instances = defs.map((def) => {
			const cell = document.createElement('div');
			cell.style.cssText = 'position:absolute;inset:0;';
			cell.style.opacity = String(def.opacity ?? 1);
			if (def.blend) cell.style.mixBlendMode = def.blend;
			container.appendChild(cell);
			return def.pattern(cell, { ...base, ...def.options });
		});

		return {
			start() {
				for (const i of instances) i.start();
			},
			stop() {
				for (const i of instances) i.stop();
			},
			update(next) {
				for (const i of instances) i.update(next);
			},
			resize() {
				for (const i of instances) i.resize();
			},
			refresh() {
				for (const i of instances) i.refresh();
			},
			destroy() {
				for (const i of instances) i.destroy();
				container.remove();
			}
		};
	};
}
