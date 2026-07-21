import svelte from '@anarkisti/eslint-config/svelte';

import svelteConfig from './svelte.config.js';

// One mixed package (vanilla TS core + a single .svelte wrapper). The house svelte
// preset (node base + eslint-plugin-svelte + TS parser) lints both.
export default [...svelte(svelteConfig), { ignores: ['dist/'] }];
