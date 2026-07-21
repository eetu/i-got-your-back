import { expect, test } from 'vitest';

import { resolveTheme } from './theme';

test('resolves a named theme', () => {
	const p = resolveTheme('neon');
	expect(p.bg).toBe('#05010d');
	expect(p.accents.length).toBeGreaterThan(0);
});

test('accent() wraps around the accent list', () => {
	const p = resolveTheme('ink');
	expect(p.accent(0)).toBe(p.accent(p.accents.length));
	expect(p.accent(-1)).toBe(p.accent(p.accents.length - 1));
});

test('accepts a custom palette', () => {
	const p = resolveTheme({ bg: '#111', fg: '#eee', accents: ['#f0f'] });
	expect(p.bg).toBe('#111');
	expect(p.accent(3)).toBe('#f0f');
});

test('falls back to ink for an unknown name', () => {
	// @ts-expect-error deliberately invalid theme name
	expect(resolveTheme('nope').bg).toBe(resolveTheme('ink').bg);
});
