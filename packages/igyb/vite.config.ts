import { resolve } from 'node:path';

import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// @anarkisti/igyb ships as an ESM library. To keep it honestly tree-shakeable, the
// build preserves the source module graph (one dist file per src module) instead of
// flattening into a single bundle — so importing one pattern pulls only its deps.
// Tests split by filename: pure runtime/import-safety in node, the canvas/WebGL mount
// path in real headless chromium (jsdom has no canvas/GL).
export default defineConfig({
	plugins: [
		dts({
			include: ['src'],
			exclude: ['src/**/*.test.ts', 'src/**/*.browser.test.ts', 'src/svelte/**']
		})
	],
	build: {
		target: 'esnext',
		sourcemap: true,
		lib: {
			// `registry` is a second entry so it emits its own dist file (it isn't imported by
			// `index`, which stays lean/tree-shakeable). preserveModules shares the rest.
			entry: {
				index: resolve(import.meta.dirname, 'src/index.ts'),
				registry: resolve(import.meta.dirname, 'src/registry.ts')
			},
			formats: ['es']
		},
		rollupOptions: {
			output: {
				preserveModules: true,
				preserveModulesRoot: 'src',
				entryFileNames: '[name].js'
			}
		}
	},
	test: {
		projects: [
			{
				test: {
					name: 'unit',
					environment: 'node',
					include: ['src/**/*.test.ts'],
					exclude: ['src/**/*.browser.test.ts']
				}
			},
			{
				test: {
					name: 'browser',
					include: ['src/**/*.browser.test.ts'],
					browser: {
						enabled: true,
						headless: true,
						provider: playwright(),
						instances: [{ browser: 'chromium' }]
					}
				}
			}
		]
	}
});
