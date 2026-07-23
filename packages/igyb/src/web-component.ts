import { patternById } from './registry';
import type { Background, BaseOptions } from './types';

/**
 * `<igyb-background>` — a framework-agnostic custom element wrapping any built-in pattern.
 * Resolves the pattern by name from the registry, so it works in plain HTML, React, Vue, …
 *
 * ```html
 * <igyb-background pattern="gradientMesh" theme="sunset" interactive></igyb-background>
 * ```
 *
 * Style the element to give it a size: `igyb-background { display: block; inline-size: 100%; block-size: 100vh; }`.
 * Attributes: `pattern`, `theme`, `interactive` (boolean or `"fine"`), `speed`, `paused`.
 */
export class IgybBackgroundElement extends HTMLElement {
	private bg?: Background;

	static get observedAttributes(): string[] {
		return ['pattern', 'theme', 'interactive', 'speed', 'paused'];
	}

	connectedCallback(): void {
		this.mount();
	}

	disconnectedCallback(): void {
		this.bg?.destroy();
		this.bg = undefined;
	}

	attributeChangedCallback(name: string, prev: string | null, next: string | null): void {
		if (!this.bg || prev === next) return;
		if (name === 'pattern') {
			this.mount(); // pattern change → recreate
			return;
		}
		if (name === 'paused') {
			if (this.hasAttribute('paused')) this.bg.stop();
			else this.bg.start();
			return;
		}
		this.bg.update(this.readOptions());
	}

	private readOptions(): Partial<BaseOptions> {
		const opts: Partial<BaseOptions> = {};
		const theme = this.getAttribute('theme');
		if (theme) opts.theme = theme as BaseOptions['theme'];
		if (this.hasAttribute('interactive')) {
			opts.interactive = this.getAttribute('interactive') === 'fine' ? 'fine' : true;
		}
		const speed = this.getAttribute('speed');
		if (speed) opts.speed = Number(speed);
		return opts;
	}

	private mount(): void {
		this.bg?.destroy();
		this.bg = undefined;
		const id = this.getAttribute('pattern') ?? 'flowField';
		const meta = patternById(id);
		if (!meta) {
			console.warn(`[igyb] <igyb-background>: unknown pattern "${id}"`);
			return;
		}
		if (getComputedStyle(this).display === 'inline') this.style.display = 'block';
		this.bg = meta.factory(this, { ...meta.defaults, ...this.readOptions() });
		if (!this.hasAttribute('paused')) this.bg.start();
	}
}

/**
 * Register the {@link IgybBackgroundElement} custom element (default tag `igyb-background`).
 * Call once, client-side. Safe to call more than once — a duplicate registration is skipped.
 */
export function register(tag = 'igyb-background'): void {
	if (typeof customElements !== 'undefined' && !customElements.get(tag)) {
		customElements.define(tag, IgybBackgroundElement);
	}
}
