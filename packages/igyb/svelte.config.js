import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Consumed by svelte-check (typecheck) and the eslint svelte preset. The wrapper
// ships as .svelte source; the consumer compiles it.
export default {
	preprocess: vitePreprocess(),
	compilerOptions: {
		// Force runes for our own components, but leave node_modules alone.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	}
};
