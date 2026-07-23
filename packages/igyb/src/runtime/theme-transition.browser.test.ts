import { expect, test } from 'vitest';

import { defineCanvas2D } from './define';

test('themeTransition crossfades the palette then settles on the new theme', async () => {
	const host = document.createElement('div');
	host.style.width = '120px';
	host.style.height = '90px';
	document.body.appendChild(host);

	const seen: string[] = [];
	const probe = defineCanvas2D({
		defaults: {},
		frame(env) {
			seen.push(env.palette.bg);
		}
	});
	const bg = probe(host, {
		theme: 'ink',
		themeTransition: 0.25,
		reducedMotion: 'off',
		autoPause: false
	});
	bg.start();

	bg.update({ theme: 'paper' });
	await new Promise((r) => setTimeout(r, 600));

	// Settled exactly on paper's background…
	expect(seen[seen.length - 1]).toBe('#f5f4f2');
	// …having passed through interpolated rgb() colors on the way.
	expect(seen.some((c) => c.startsWith('rgb('))).toBe(true);

	bg.destroy();
	host.remove();
});
