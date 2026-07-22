import { expect, test } from 'vitest';

import { defineCanvas2D } from './define';

// A minimal pattern that just reports how many pointers it sees each frame.
function mountProbe(): { host: HTMLDivElement; canvas: HTMLCanvasElement; count: () => number } {
	const host = document.createElement('div');
	host.style.width = '200px';
	host.style.height = '200px';
	document.body.appendChild(host);

	let seen = 0;
	const probe = defineCanvas2D({
		defaults: {},
		frame(env) {
			seen = env.pointer.points.length;
		}
	});
	const bg = probe(host, { interactive: true, animate: false });
	bg.start();
	const canvas = host.querySelector('canvas') as HTMLCanvasElement;
	return { host, canvas, count: () => (bg.resize(), seen) };
}

test('tracks multiple simultaneous pointers (multitouch)', () => {
	const { host, canvas, count } = mountProbe();

	canvas.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientX: 10, clientY: 10 }));
	canvas.dispatchEvent(
		new PointerEvent('pointerdown', { pointerId: 2, clientX: 40, clientY: 40, pointerType: 'touch' })
	);
	expect(count()).toBe(2);

	// A lifted touch is dropped…
	canvas.dispatchEvent(new PointerEvent('pointerup', { pointerId: 2, pointerType: 'touch' }));
	expect(count()).toBe(1);

	host.remove();
});
