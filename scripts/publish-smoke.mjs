// Publish-integrity smoke test. Packs @anarkisti/igyb exactly as npm consumers receive
// it (prepack runs the real build), installs the tarball into a throwaway consumer, and
// imports the `/core` subpath in bare node — the only coverage of what actually ships.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: 'inherit', ...opts });
const yarn = (...args) => run('node', ['.yarn/releases/yarn-4.16.0.cjs', ...args]);

const tgz = join(tmpdir(), 'igyb-smoke.tgz');
const consumer = mkdtempSync(join(tmpdir(), 'igyb-consumer-'));

try {
	// pack (runs prepack → vite build)
	yarn('workspace', '@anarkisti/igyb', 'pack', '--out', tgz);

	// throwaway consumer that installs the tarball
	writeFileSync(
		join(consumer, 'package.json'),
		JSON.stringify({ name: 'igyb-smoke-consumer', private: true, type: 'module' })
	);
	run('npm', ['install', '--no-save', '--no-package-lock', tgz], { cwd: consumer });

	// bare-node import of the shipped /core entry
	const probe = join(consumer, 'probe.mjs');
	writeFileSync(
		probe,
		[
			"import * as core from '@anarkisti/igyb/core';",
			"const need = ['flowField','plasma','particles','truchet','hex','iso','defineCanvas2D','defineWebGL'];",
			'for (const n of need) {',
			"	if (typeof core[n] !== 'function') { console.error('missing export:', n); process.exit(1); }",
			'}',
			"if (typeof core.palettes?.ink?.bg !== 'string') { console.error('missing palettes'); process.exit(1); }",
			"console.log('OK — /core imports cleanly with', need.length, 'exports');"
		].join('\n')
	);
	run('node', [probe], { cwd: consumer });

	console.log('publish-smoke: PASS');
} finally {
	rmSync(consumer, { recursive: true, force: true });
	rmSync(tgz, { force: true });
}
