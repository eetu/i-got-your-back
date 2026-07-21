import { expect, test } from 'vitest';

import * as igyb from './index';

const PATTERNS = [
	'truchet',
	'hex',
	'iso',
	'particles',
	'flowField',
	'plasma',
	'matrixRain',
	'aurora',
	'dotGrid',
	'starfield'
] as const;

test('every pattern is exported as a factory function', () => {
	for (const name of PATTERNS) {
		expect(typeof igyb[name]).toBe('function');
	}
});

test('importing the core is SSR/node-safe (no browser globals at module scope)', () => {
	// This test runs in node: if any pattern or runtime module touched
	// window/document/canvas at module scope, the import above would have thrown.
	expect(igyb.palettes.ink.bg).toBeTypeOf('string');
	expect(typeof igyb.defineCanvas2D).toBe('function');
	expect(typeof igyb.defineWebGL).toBe('function');
});
