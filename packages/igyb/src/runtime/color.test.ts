import { expect, test } from 'vitest';

import { hexToRgb, mixHex, shade } from './color';

test('hexToRgb parses #rrggbb and #rgb', () => {
	expect(hexToRgb('#ffffff')).toEqual([1, 1, 1]);
	expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
	expect(hexToRgb('#f00')).toEqual([1, 0, 0]);
});

test('shade scales brightness and clamps to [0, 255]', () => {
	expect(shade('#808080', 0)).toBe('rgb(0, 0, 0)');
	expect(shade('#ffffff', 2)).toBe('rgb(255, 255, 255)');
});

test('mixHex interpolates linearly', () => {
	expect(mixHex('#000000', '#ffffff', 0.5)).toBe('rgb(128, 128, 128)');
	expect(mixHex('#000000', '#ffffff', 0)).toBe('rgb(0, 0, 0)');
});
