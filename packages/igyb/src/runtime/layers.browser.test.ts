import { expect, test } from 'vitest';

import { grain } from '../patterns/grain';
import { truchet } from '../patterns/truchet';
import { layers } from './layers';

test('layers stacks patterns on separate canvases and tears down cleanly', () => {
	const host = document.createElement('div');
	host.style.width = '200px';
	host.style.height = '160px';
	document.body.appendChild(host);

	const bg = layers(
		[
			{ pattern: truchet },
			{ pattern: grain, blend: 'overlay', opacity: 0.6 }
		],
		{ theme: 'neon', animate: false }
	)(host);
	bg.start();

	// One canvas per layer, stacked in the host.
	expect(host.querySelectorAll('canvas').length).toBe(2);

	bg.destroy();
	expect(host.querySelectorAll('canvas').length).toBe(0);
	host.remove();
});
