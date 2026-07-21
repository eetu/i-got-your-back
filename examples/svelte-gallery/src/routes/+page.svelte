<script lang="ts">
	// Playground: pick a background pattern; a full-bleed <Background> renders it live. The
	// stage is the installed library (@anarkisti/igyb/svelte + /core); the controls are a
	// working tour of the option surface — palette, motion and per-pattern params — with a
	// copy-ready import snippet. A top-level header holds the identity + light/dark toggle;
	// everything you tweak lives in a grouped side panel (an off-canvas sheet on mobile).
	import type { ThemeName } from '@anarkisti/igyb/core';
	import Background from '@anarkisti/igyb/svelte';

	import Segmented from '$lib/components/Segmented.svelte';
	import Select from '$lib/components/Select.svelte';
	import Slider from '$lib/components/Slider.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import ToggleChip from '$lib/components/ToggleChip.svelte';
	import { type PatternEntry, patterns, themeNames } from '$lib/registry';

	// Pattern selection + its (kind-split) param state. Ranges and selects live in two
	// typed records so Slider (number) and Select/Segmented (string) can `bind:value` into
	// them without casts; both are spread into the live options object.
	let selectedId = $state(patterns[0].id);
	const entry = $derived(patterns.find((p) => p.id === selectedId) ?? patterns[0]);

	function seed(e: PatternEntry): { r: Record<string, number>; s: Record<string, string> } {
		const r: Record<string, number> = {};
		const s: Record<string, string> = {};
		for (const p of e.params) {
			if (p.kind === 'range') r[p.key] = e.defaults[p.key] as number;
			else s[p.key] = e.defaults[p.key] as string;
		}
		return { r, s };
	}

	let rangeVals = $state(seed(patterns[0]).r);
	let selectVals = $state(seed(patterns[0]).s);

	function select(e: PatternEntry): void {
		selectedId = e.id;
		const next = seed(e);
		rangeVals = next.r;
		selectVals = next.s;
	}

	// Shared base options (bound to the controls below).
	let palette = $state<ThemeName>('ink');
	let animate = $state(true);
	let interactive = $state(true);
	let speed = $state(1);

	// The live options object pushed into <Background> — theme + motion + params. The
	// component diffs this and calls `bg.update()` without re-creating the canvas.
	const options = $derived({
		theme: palette,
		animate,
		speed,
		interactive,
		...entry.defaults, // non-param defaults (e.g. glyphTile's `glyph`) flow through …
		...rangeVals, // … then the live slider/select values override the tunable params
		...selectVals
	});

	const generative = patterns.filter((p) => p.category === 'Generative');
	const geometric = patterns.filter((p) => p.category === 'Geometric');

	// Copy-ready usage: the tree-shaken import + a minimal <Background> for the current
	// pattern (per-pattern factory from the `/core` entry, wrapper from `/svelte`).
	const snippet = $derived(
		`import Background from '@anarkisti/igyb/svelte';\n` +
			`import { ${entry.id} } from '@anarkisti/igyb/core';\n\n` +
			`<Background\n\tpattern={${entry.id}}\n\toptions={{ theme: '${palette}', interactive: ${interactive} }}\n/>`
	);

	let copied = $state(false);
	async function copySnippet(): Promise<void> {
		try {
			await navigator.clipboard.writeText(snippet);
			copied = true;
			setTimeout(() => (copied = false), 1200);
		} catch {
			// Clipboard blocked (insecure context / denied permission) — no-op.
		}
	}

	const fmtParam = (v: number): string => (Number.isInteger(v) ? String(v) : v.toFixed(1));

	// Panel: a static right column on desktop; an off-canvas sheet on mobile.
	let panelOpen = $state(false);
	const onKeydown = (e: KeyboardEvent): void => {
		if (e.key === 'Escape' && panelOpen) panelOpen = false;
	};
</script>

<svelte:window onkeydown={onKeydown} />

<div class="app">
	<header>
		<div class="brand">
			<span class="glyph" aria-hidden="true"></span>
			<div class="brand-text">
				<h1>I Got Your Back</h1>
				<p>Tree-shakeable repeating &amp; generative backgrounds</p>
			</div>
		</div>
		{#if interactive}
			<span class="hint">drag on the canvas to interact</span>
		{/if}
		<a
			class="repo"
			href="https://github.com/eetu/i-got-your-back"
			target="_blank"
			rel="noreferrer"
			aria-label="I Got Your Back on GitHub"
			title="View source on GitHub"
		>
			<!-- GitHub mark (brand icon; Lucide dropped its logo set) -->
			<svg viewBox="0 0 16 16" width="17" height="17" fill="currentColor" aria-hidden="true">
				<path
					d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
				/>
			</svg>
		</a>
		<ThemeToggle />
		<button
			class="panel-toggle"
			onclick={() => (panelOpen = !panelOpen)}
			aria-label="controls"
			aria-expanded={panelOpen}
			aria-controls="controls-panel"
		>
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M4 6h16M4 12h16M4 18h16" />
			</svg>
		</button>
	</header>

	<div class="stage">
		<!-- Keyed on the pattern so switching factories remounts a fresh canvas; option
		     tweaks update live via the component's own `bg.update()`. -->
		{#key entry.id}
			<Background pattern={entry.factory} {options} />
		{/key}
		<span class="tag">{entry.name} · {entry.renderer} · {entry.category}</span>
	</div>

	<!-- scrim (mobile only) closes the sheet -->
	<button
		class="scrim"
		class:open={panelOpen}
		aria-label="close controls"
		tabindex={panelOpen ? 0 : -1}
		onclick={() => (panelOpen = false)}
	></button>

	<aside id="controls-panel" class="panel" class:open={panelOpen}>
		<div class="panel-head">
			<span>controls</span>
			<button class="sheet-close" onclick={() => (panelOpen = false)} aria-label="close controls">
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M18 6 6 18M6 6l12 12" />
				</svg>
			</button>
		</div>

		<section>
			<h2>pattern</h2>
			<p class="cat">Generative</p>
			<div class="grid">
				{#each generative as p (p.id)}
					<button class="pick" class:active={p.id === selectedId} onclick={() => select(p)}>
						{p.name}<small>{p.renderer}</small>
					</button>
				{/each}
			</div>
			<p class="cat">Geometric</p>
			<div class="grid">
				{#each geometric as p (p.id)}
					<button class="pick" class:active={p.id === selectedId} onclick={() => select(p)}>
						{p.name}<small>{p.renderer}</small>
					</button>
				{/each}
			</div>
		</section>

		<section>
			<h2>theme &amp; motion</h2>
			<div class="row">
				<span class="rlabel">theme</span>
				<Select
					bind:value={palette}
					ariaLabel="theme"
					options={themeNames.map((t) => ({ value: t, label: t }))}
				/>
			</div>
			<div class="chips">
				<ToggleChip bind:checked={animate} label="animate" />
				<ToggleChip bind:checked={interactive} label="interactive" />
			</div>
			<Slider
				label="speed"
				bind:value={speed}
				min={0.1}
				max={3}
				step={0.1}
				format={(v) => `${v.toFixed(1)}×`}
			/>
		</section>

		<section>
			<h2>{entry.name} params</h2>
			{#each entry.params as p (p.key)}
				{#if p.kind === 'range'}
					<Slider
						label={p.label}
						bind:value={rangeVals[p.key]}
						min={p.min}
						max={p.max}
						step={p.step}
						format={fmtParam}
					/>
				{:else if p.choices.length <= 3}
					<div class="row">
						<span class="rlabel">{p.label}</span>
						<Segmented
							bind:value={selectVals[p.key]}
							ariaLabel={p.label}
							options={p.choices.map((c) => ({ value: c, label: c }))}
						/>
					</div>
				{:else}
					<div class="row">
						<span class="rlabel">{p.label}</span>
						<Select
							bind:value={selectVals[p.key]}
							ariaLabel={p.label}
							options={p.choices.map((c) => ({ value: c, label: c }))}
						/>
					</div>
				{/if}
			{/each}
		</section>

		<section>
			<div class="usage-head">
				<h2>usage</h2>
				<button class="copy" onclick={() => void copySnippet()}>{copied ? 'copied' : 'copy'}</button
				>
			</div>
			<pre>{snippet}</pre>
		</section>
	</aside>
</div>

<style>
	.app {
		display: grid;
		grid-template-columns: 1fr 320px;
		grid-template-rows: auto 1fr;
		grid-template-areas:
			'header header'
			'stage panel';
		height: 100dvh;
	}

	header {
		grid-area: header;
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 8px 16px;
		background: var(--halo-bg-light);
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.glyph {
		width: 26px;
		height: 26px;
		border-radius: 7px;
		background: linear-gradient(135deg, var(--halo-accent), #ffb37a);
		box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--halo-accent) 40%, transparent);
	}
	.brand-text h1 {
		margin: 0;
		font-family: var(--halo-font-heading);
		font-weight: 600;
		font-size: 15px;
		letter-spacing: -0.01em;
		color: var(--halo-text-main);
	}
	.brand-text p {
		margin: 0;
		font-size: 11px;
		color: var(--halo-text-muted);
	}
	.hint {
		margin-left: auto;
		font-size: 12px;
		color: var(--halo-text-muted);
	}
	/* When the hint is hidden (not interactive), the repo link still hugs the right. */
	.hint + .repo {
		margin-left: 0;
	}
	.repo {
		margin-left: auto;
		display: inline-flex;
		align-items: center;
		color: var(--halo-text-muted);
		transition: color var(--halo-d-fast) ease-out;
	}
	.repo:hover {
		color: var(--halo-text-main);
	}
	.panel-toggle {
		display: none; /* mobile only */
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border: 1px solid var(--halo-border);
		border-radius: var(--halo-radius);
		background: var(--halo-bg-main);
		color: var(--halo-text-main);
		cursor: pointer;
	}

	.stage {
		grid-area: stage;
		position: relative;
		min-height: 0;
		overflow: hidden;
		background: var(--halo-bg-main);
	}
	.tag {
		position: absolute;
		left: 12px;
		bottom: 12px;
		padding: 5px 10px;
		border-radius: var(--halo-radius);
		font-size: 12px;
		font-weight: 500;
		color: #fff;
		background: rgba(0, 0, 0, 0.55);
		backdrop-filter: blur(4px);
		pointer-events: none;
	}

	.panel {
		grid-area: panel;
		overflow-y: auto;
		padding: 16px;
		background: var(--halo-bg-light);
		box-shadow: var(--halo-shadow);
	}
	.panel-head {
		display: none; /* only shown as a sheet on mobile */
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
		font-family: var(--halo-font-heading);
		font-size: 13px;
		color: var(--halo-text-main);
	}
	.sheet-close {
		display: inline-flex;
		border: none;
		background: none;
		color: var(--halo-text-muted);
		cursor: pointer;
	}
	section {
		padding: 14px 0;
	}
	section + section {
		border-top: 1px solid var(--halo-border);
	}
	section:first-of-type {
		padding-top: 2px;
	}
	h2 {
		margin: 0 0 12px;
		font-family: var(--halo-font-heading);
		font-weight: 500;
		font-size: 11px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--halo-text-muted);
	}
	.cat {
		margin: 0 0 8px;
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--halo-text-muted);
	}
	.cat:not(:first-of-type) {
		margin-top: 12px;
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}
	.pick {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2px;
		padding: 8px 10px;
		border: 1px solid var(--halo-border);
		border-radius: var(--halo-radius);
		background: var(--halo-bg-main);
		font: inherit;
		font-size: 13px;
		font-weight: 500;
		color: var(--halo-text-main);
		cursor: pointer;
		transition:
			border-color var(--halo-d-fast) ease-out,
			background var(--halo-d-fast) ease-out;
	}
	.pick small {
		font-size: 10px;
		font-weight: 400;
		color: var(--halo-text-muted);
	}
	.pick:hover {
		border-color: var(--halo-text-muted);
	}
	.pick.active {
		border-color: var(--halo-accent);
		background: var(--halo-accent-soft);
	}
	.pick:focus-visible {
		outline: 2px solid var(--halo-accent);
		outline-offset: 1px;
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		margin-bottom: 12px;
	}
	.rlabel {
		font-size: 13px;
		color: var(--halo-text-main);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 14px;
	}
	/* Sliders sit in a column with breathing room. */
	.panel :global(.slider) {
		margin-bottom: 14px;
	}

	.usage-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.usage-head h2 {
		margin-bottom: 0;
	}
	.copy {
		padding: 4px 10px;
		border: 1px solid var(--halo-border);
		border-radius: var(--halo-radius);
		background: var(--halo-bg-main);
		font: inherit;
		font-size: 12px;
		color: var(--halo-text-muted);
		cursor: pointer;
		transition:
			border-color var(--halo-d-fast) ease-out,
			color var(--halo-d-fast) ease-out;
	}
	.copy:hover {
		border-color: var(--halo-text-muted);
		color: var(--halo-text-main);
	}
	.copy:focus-visible {
		outline: 2px solid var(--halo-accent);
		outline-offset: 1px;
	}
	pre {
		margin: 12px 0 0;
		padding: 10px;
		border-radius: var(--halo-radius);
		background: var(--halo-bg-main);
		border: 1px solid var(--halo-border);
		font-family: ui-monospace, 'SF Mono', 'Menlo', monospace;
		font-size: 12px;
		line-height: 1.5;
		color: var(--halo-text-main);
		overflow-x: auto;
		white-space: pre-wrap;
	}

	.scrim {
		display: none;
		border: none;
		padding: 0;
	}

	/* --- mobile: panel becomes an off-canvas sheet --- */
	@media (max-width: 720px) {
		.app {
			grid-template-columns: 1fr;
			grid-template-areas:
				'header'
				'stage';
		}
		.hint {
			display: none; /* free header width */
		}
		header {
			gap: 10px;
			padding: 8px 12px;
		}
		.brand {
			flex: 1 1 auto;
			min-width: 0;
		}
		.brand-text h1 {
			font-size: 14px;
		}
		.brand-text p {
			display: none;
		}
		.repo {
			margin-left: auto;
		}
		.panel-toggle {
			display: inline-flex;
			flex: 0 0 auto;
		}
		.panel-head {
			display: flex;
		}
		.scrim {
			position: fixed;
			inset: 0;
			z-index: 1;
			background: color-mix(in srgb, var(--halo-bg-main) 55%, transparent);
			opacity: 0;
			pointer-events: none;
			transition: opacity var(--halo-d-fast) ease-out;
		}
		.scrim.open {
			display: block;
			opacity: 1;
			pointer-events: auto;
		}
		.panel {
			position: fixed;
			top: 0;
			right: 0;
			z-index: 2;
			width: min(320px, 90vw);
			height: 100dvh;
			transform: translateX(100%);
			transition: transform var(--halo-d-fast) ease-out;
		}
		.panel.open {
			transform: translateX(0);
		}
	}
</style>
