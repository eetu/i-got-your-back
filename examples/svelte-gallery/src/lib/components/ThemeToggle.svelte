<script lang="ts">
	// Header theme control: one button that cycles auto → light → dark, showing the
	// current mode's icon (inline SVGs — the gallery keeps its dependency surface tiny).
	import { cycleTheme, theme } from '$lib/theme.svelte';
</script>

<button
	class="theme-toggle"
	onclick={cycleTheme}
	title="theme: {theme.mode} (click to change)"
	aria-label="theme: {theme.mode}, click to change"
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
		{#if theme.mode === 'light'}
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2" />
			<path d="M12 20v2" />
			<path d="m4.93 4.93 1.41 1.41" />
			<path d="m17.66 17.66 1.41 1.41" />
			<path d="M2 12h2" />
			<path d="M20 12h2" />
			<path d="m6.34 17.66-1.41 1.41" />
			<path d="m19.07 4.93-1.41 1.41" />
		{:else if theme.mode === 'dark'}
			<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
		{:else}
			<rect width="20" height="14" x="2" y="3" rx="2" />
			<path d="M8 21h8" />
			<path d="M12 17v4" />
		{/if}
	</svg>
</button>

<style>
	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border: 1px solid var(--halo-border);
		border-radius: var(--halo-radius);
		background: var(--halo-bg-main);
		color: var(--halo-text-main);
		cursor: pointer;
		transition: color var(--halo-d-fast) ease-out;
	}
	.theme-toggle:hover {
		color: var(--halo-accent);
	}
	.theme-toggle:focus-visible {
		outline: 2px solid var(--halo-accent);
		outline-offset: 1px;
	}
</style>
