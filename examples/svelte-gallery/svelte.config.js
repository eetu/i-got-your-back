import process from 'node:process';

import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// GitHub Pages serves this under /<repo> — the deploy workflow sets BASE_PATH.
const base = process.env.BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		// Force runes mode (Svelte 5), skipping node_modules. Removable in Svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// Pure SPA: no server runtime. The known route prerenders to a static shell page
		// (see +layout.ts) so / loads with a real 200; the fallback must be 404.html
		// because GitHub Pages has no rewrites — an unknown path (or a hard refresh on a
		// client-only URL) serves 404.html, which boots the SPA router.
		adapter: adapter({
			pages: 'dist',
			assets: 'dist',
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		paths: { base },
		serviceWorker: { register: false },
		// Resolve the workspace library from source (SvelteKit threads these into both
		// Vite and the generated tsconfig), so dev/build/typecheck need no prior package
		// build. Published, the app would depend on @anarkisti/igyb proper.
		alias: {
			'@anarkisti/igyb/core': '../../packages/igyb/src/index.ts',
			'@anarkisti/igyb/registry': '../../packages/igyb/src/registry.ts',
			'@anarkisti/igyb/svelte': '../../packages/igyb/src/svelte/Background.svelte'
		}
	}
};

export default config;
