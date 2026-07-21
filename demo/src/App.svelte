<script lang="ts">
  import Background from 'i-got-your-back/svelte';
  import { patterns, themeNames, type PatternEntry } from './registry';

  let selectedId = $state(patterns[0].id);
  let theme = $state<(typeof themeNames)[number]>('ink');
  let animate = $state(true);
  let interactive = $state(true);
  let speed = $state(1);
  let params = $state<Record<string, unknown>>({ ...patterns[0].defaults });

  const entry = $derived(patterns.find((p) => p.id === selectedId) ?? patterns[0]);
  const options = $derived({ theme, animate, speed, interactive, ...params });

  const geometric = patterns.filter((p) => p.category === 'Geometric');
  const generative = patterns.filter((p) => p.category === 'Generative');

  const snippet = $derived(
    `import Background from 'i-got-your-back/svelte';\n` +
      `import { ${entry.id} } from 'i-got-your-back';\n\n` +
      `<Background\n  pattern={${entry.id}}\n  options={{ theme: '${theme}', interactive: ${interactive} }}\n/>`,
  );

  function select(e: PatternEntry): void {
    selectedId = e.id;
    params = { ...e.defaults };
  }

  function setParam(key: string, value: unknown): void {
    params = { ...params, [key]: value };
  }
</script>

<div class="shell">
  <header>
    <div class="brand">
      <span class="glyph" aria-hidden="true"></span>
      <div>
        <h1>I Got Your Back</h1>
        <p>Tree-shakeable repeating &amp; generative backgrounds</p>
      </div>
    </div>
    <a class="gh" href="https://github.com/eetu/i-got-your-back" rel="noreferrer">GitHub ↗</a>
  </header>

  <div class="body">
    <section class="stage">
      {#key entry.id}
        <Background pattern={entry.factory} {options} />
      {/key}
      <span class="tag">{entry.name} · {entry.renderer} · {entry.category}</span>
    </section>

    <aside class="panel">
      <fieldset>
        <legend>Pattern</legend>
        <p class="cat">Generative</p>
        <div class="grid">
          {#each generative as p (p.id)}
            <button class:active={p.id === selectedId} onclick={() => select(p)}>
              {p.name}<small>{p.renderer}</small>
            </button>
          {/each}
        </div>
        <p class="cat">Geometric</p>
        <div class="grid">
          {#each geometric as p (p.id)}
            <button class:active={p.id === selectedId} onclick={() => select(p)}>
              {p.name}<small>{p.renderer}</small>
            </button>
          {/each}
        </div>
      </fieldset>

      <fieldset>
        <legend>Theme &amp; motion</legend>
        <label class="row">
          <span>Theme</span>
          <select bind:value={theme}>
            {#each themeNames as t (t)}
              <option value={t}>{t}</option>
            {/each}
          </select>
        </label>
        <label class="row">
          <span>Animate</span>
          <input type="checkbox" bind:checked={animate} />
        </label>
        <label class="row">
          <span>Interactive</span>
          <input type="checkbox" bind:checked={interactive} />
        </label>
        <label class="row">
          <span>Speed <em>{speed.toFixed(1)}×</em></span>
          <input type="range" min="0.1" max="3" step="0.1" bind:value={speed} />
        </label>
      </fieldset>

      <fieldset>
        <legend>{entry.name} params</legend>
        {#each entry.params as p (p.key)}
          <label class="row">
            <span>{p.label}</span>
            {#if p.kind === 'range'}
              <input
                type="range"
                min={p.min}
                max={p.max}
                step={p.step}
                value={params[p.key] as number}
                oninput={(e) => setParam(p.key, +e.currentTarget.value)}
              />
            {:else}
              <select
                value={params[p.key] as string}
                onchange={(e) => setParam(p.key, e.currentTarget.value)}
              >
                {#each p.choices as c (c)}
                  <option value={c}>{c}</option>
                {/each}
              </select>
            {/if}
          </label>
        {/each}
      </fieldset>

      <fieldset>
        <legend>Usage</legend>
        <pre>{snippet}</pre>
      </fieldset>
    </aside>
  </div>
</div>

<style>
  .shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .glyph {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    background: linear-gradient(135deg, var(--accent), #ffb37a);
    box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--accent) 40%, transparent);
  }

  h1 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.05rem;
    letter-spacing: -0.01em;
  }

  header p {
    margin: 0;
    font-size: 0.75rem;
    color: var(--muted);
  }

  .gh {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--accent);
    text-decoration: none;
  }

  .body {
    flex: 1;
    display: flex;
    min-height: 0;
  }

  .stage {
    flex: 1;
    position: relative;
    min-width: 0;
    overflow: hidden;
  }

  .tag {
    position: absolute;
    left: 1rem;
    bottom: 1rem;
    padding: 0.35rem 0.6rem;
    border-radius: var(--radius);
    font-size: 0.72rem;
    font-weight: 500;
    color: #fff;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(4px);
    pointer-events: none;
  }

  .panel {
    width: 320px;
    flex-shrink: 0;
    overflow-y: auto;
    padding: 1rem;
    border-left: 1px solid var(--border);
    background: var(--surface);
  }

  fieldset {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin: 0 0 1rem;
    padding: 0.75rem;
  }

  legend {
    padding: 0 0.4rem;
    font-family: var(--font-display);
    font-size: 0.8rem;
    color: var(--muted);
  }

  .cat {
    margin: 0.4rem 0 0.35rem;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.4rem;
  }

  .grid button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.1rem;
    padding: 0.5rem 0.6rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface-2);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition:
      border-color 0.15s,
      background 0.15s;
  }

  .grid button small {
    font-size: 0.62rem;
    font-weight: 400;
    color: var(--muted);
  }

  .grid button:hover {
    border-color: var(--accent);
  }

  .grid button.active {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 14%, var(--surface));
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin: 0.5rem 0;
    font-size: 0.85rem;
  }

  .row span {
    color: var(--muted);
  }

  .row em {
    font-style: normal;
    color: var(--text);
  }

  .row select,
  .row input[type='range'] {
    flex: 1;
    max-width: 160px;
  }

  input[type='range'],
  input[type='checkbox'] {
    accent-color: var(--accent);
  }

  pre {
    margin: 0;
    padding: 0.6rem;
    border-radius: var(--radius);
    background: var(--surface-2);
    font-size: 0.72rem;
    line-height: 1.5;
    overflow-x: auto;
    white-space: pre-wrap;
  }

  @media (max-width: 820px) {
    .body {
      flex-direction: column;
    }
    .stage {
      min-height: 46vh;
    }
    .panel {
      width: 100%;
      border-left: none;
      border-top: 1px solid var(--border);
    }
  }
</style>
