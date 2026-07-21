import type { Component } from 'svelte';

import type { AnyBackgroundFactory, BaseOptions } from '../types';

export type BackgroundProps = {
	/** The pattern factory, e.g. `truchet` or `flowField`. */
	pattern: AnyBackgroundFactory;
	/** Options passed to the pattern; updated live when this changes. */
	options?: BaseOptions & Record<string, unknown>;
	/** Pause without destroying. */
	paused?: boolean;
	/** Extra classes for the host element. */
	class?: string;
};

declare const Background: Component<BackgroundProps>;
export default Background;
