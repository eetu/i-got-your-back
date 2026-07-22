import { expect, test } from 'vitest';

import { darken, hexToRgb, lighten, mix, mixHex, shade, toRgb, toRgbString } from './color';

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

test('toRgb parses hex (long + short) and rgb()/rgba() strings', () => {
	expect(toRgb('#ffffff')).toEqual([255, 255, 255]);
	expect(toRgb('#f00')).toEqual([255, 0, 0]);
	expect(toRgb('rgb(12, 34, 56)')).toEqual([12, 34, 56]);
	expect(toRgb('rgba(12, 34, 56, 0.5)')).toEqual([12, 34, 56]);
});

test('toRgbString rounds and clamps to 0–255', () => {
	expect(toRgbString([0.4, 128.6, 300])).toBe('rgb(0, 129, 255)');
});

test('mix bridges hex and rgb() inputs', () => {
	expect(mix('#000000', 'rgb(255, 255, 255)', 0.5)).toBe('rgb(128, 128, 128)');
	expect(mix('#000', '#fff', 1)).toBe('rgb(255, 255, 255)');
});

test('lighten toward white, darken toward black', () => {
	expect(lighten('#808080', 0)).toBe('rgb(128, 128, 128)');
	expect(lighten('#808080', 1)).toBe('rgb(255, 255, 255)');
	expect(darken('#808080', 1)).toBe('rgb(0, 0, 0)');
});
