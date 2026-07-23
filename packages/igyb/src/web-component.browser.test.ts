import { expect, test } from 'vitest';

import { IgybBackgroundElement, register } from './web-component';

test('<igyb-background> mounts the named pattern and tears down on disconnect', () => {
	register();
	const el = document.createElement('igyb-background') as IgybBackgroundElement;
	el.setAttribute('pattern', 'truchet');
	el.setAttribute('interactive', '');
	el.style.width = '160px';
	el.style.height = '120px';

	document.body.appendChild(el); // connectedCallback → mount
	expect(el.querySelector('canvas')).not.toBeNull();

	el.remove(); // disconnectedCallback → destroy
	expect(el.querySelector('canvas')).toBeNull();
});

test('an unknown pattern name is handled gracefully', () => {
	register();
	const el = document.createElement('igyb-background');
	el.setAttribute('pattern', 'does-not-exist');
	el.style.width = '80px';
	el.style.height = '80px';
	document.body.appendChild(el);
	expect(el.querySelector('canvas')).toBeNull();
	el.remove();
});
