import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Pure client-side gallery — no backend, no proxy. The @anarkisti/igyb aliases live in
// svelte.config.js (kit.alias) so they apply to Vite and svelte-check alike.
export default defineConfig({
	plugins: [sveltekit()]
});
