import { expect, test } from 'vitest';

import { grain } from '../patterns/grain';
import { truchet } from '../patterns/truchet';
import { layers } from './layers';

test('capture() returns a PNG data URL for a single pattern', () => {
	const host = document.createElement('div');
	host.style.width = '120px';
	host.style.height = '90px';
	document.body.appendChild(host);

	const bg = truchet(host, { animate: false });
	bg.start();
	expect(bg.capture().startsWith('data:image/png')).toBe(true);

	bg.destroy();
	host.remove();
});

test('capture() flattens a layered stack to one image', () => {
	const host = document.createElement('div');
	host.style.width = '120px';
	host.style.height = '90px';
	document.body.appendChild(host);

	const bg = layers([{ pattern: truchet }, { pattern: grain, blend: 'overlay' }])(host);
	bg.start();
	expect(bg.capture().startsWith('data:image/png')).toBe(true);

	bg.destroy();
	host.remove();
});
