import { expect, test } from 'vitest';

import { glyphTile } from '../patterns/glyph-tile';
import { paletteFromCSS } from './theme';

test('paletteFromCSS reads palette roles from CSS custom properties', () => {
	const el = document.createElement('div');
	el.style.setProperty('--bg', '#101010');
	el.style.setProperty('--fg', '#eeeeee');
	el.style.setProperty('--a1', '#ff8800');
	document.body.appendChild(el);

	const p = paletteFromCSS({ bg: '--bg', fg: '--fg', accents: ['--a1'] }, el);
	expect(p.bg).toBe('#101010');
	expect(p.fg).toBe('#eeeeee');
	expect(p.accents).toEqual(['#ff8800']);

	// accents default to [fg] when omitted
	expect(paletteFromCSS({ bg: '--bg', fg: '--fg' }, el).accents).toEqual(['#eeeeee']);
	el.remove();
});

test('glyphTile hands the resolved palette to a glyph callback, and refresh() re-reads a theme thunk', () => {
	const host = document.createElement('div');
	host.style.width = '120px';
	host.style.height = '80px';
	document.body.appendChild(host);

	let seen: string | undefined;
	let current = '#111111';
	const bg = glyphTile(host, {
		animate: false,
		theme: () => ({ bg: current, fg: current, accents: [current] }),
		glyph: (_ctx, _size, _i, env) => {
			seen = env.palette.bg; // the callback can read the live theme, no module state
		}
	});
	bg.start();
	expect(seen).toBe('#111111');

	// A theme flip: the thunk now yields a new palette; refresh() re-resolves + repaints
	// without recreating the canvas.
	current = '#222222';
	bg.refresh();
	expect(seen).toBe('#222222');

	bg.destroy();
	host.remove();
});
