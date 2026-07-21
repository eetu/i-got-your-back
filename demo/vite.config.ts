import { fileURLToPath, URL } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

// Serve the library straight from source for instant HMR while developing patterns.
const src = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  base: '/i-got-your-back/',
  plugins: [svelte()],
  resolve: {
    alias: [
      { find: /^i-got-your-back\/svelte$/, replacement: src('../src/svelte/Background.svelte') },
      { find: /^i-got-your-back\/themes$/, replacement: src('../src/themes/index.ts') },
      { find: /^i-got-your-back$/, replacement: src('../src/index.ts') },
    ],
  },
});
