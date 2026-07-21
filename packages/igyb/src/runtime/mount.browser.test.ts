import { expect, test } from 'vitest';

import { flowField } from '../patterns/flow-field';
import { truchet } from '../patterns/truchet';

test('a Canvas2D pattern mounts a filled canvas and tears down cleanly', () => {
	const host = document.createElement('div');
	host.style.width = '240px';
	host.style.height = '160px';
	document.body.appendChild(host);

	const bg = truchet(host, { animate: false });
	bg.start();

	const canvas = host.querySelector('canvas');
	expect(canvas).not.toBeNull();
	expect(canvas!.width).toBeGreaterThan(0);
	expect(canvas!.height).toBeGreaterThan(0);

	bg.destroy();
	expect(host.querySelector('canvas')).toBeNull();
	host.remove();
});

test('a WebGL pattern acquires a webgl2 context', () => {
	const host = document.createElement('div');
	host.style.width = '240px';
	host.style.height = '160px';
	document.body.appendChild(host);

	const bg = flowField(host, { animate: false });
	bg.start();

	const canvas = host.querySelector('canvas');
	expect(canvas).not.toBeNull();
	expect(canvas!.getContext('webgl2')).not.toBeNull();

	bg.destroy();
	host.remove();
});
