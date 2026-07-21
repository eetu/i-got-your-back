# I Got Your Back

Tree-shakeable repeating & generative **backgrounds** for the web — geometric tiles and
WebGL generative art. A framework-agnostic core (Canvas2D + WebGL) with a thin Svelte wrapper,
shipped as a single npm package: **`@anarkisti/igyb`**.

### ▶ [Live playground →](https://eetu.github.io/i-got-your-back/)

> The playground goes live after the first push to `main` (GitHub Pages / Actions).

Part of eetu's homebrew family — a **library** (no backend, no Pi deploy): the demo ships to
GitHub Pages, the package publishes to npm. Mirrors the [`glowbox`](https://github.com/eetu/glowbox)
toolchain (yarn workspaces, Vite lib build, `@anarkisti/eslint-config`, size-limit, OIDC release).

- **Tree-shakeable** — import only the patterns you use. `sideEffects: false`; the build
  preserves the source module graph, and size-limit enforces per-pattern budgets.
- **Themed** — four built-in palettes or bring your own; swap live.
- **Animated & interactive** — RAF loop, pointer reactions, per-pattern params.
- **Accessible** — honors `prefers-reduced-motion` (freezes to a static frame) by default.
- **Framework-agnostic core** — a Svelte wrapper today; React/Vue are ~30 lines away.

## Install

```sh
yarn add @anarkisti/igyb
```

## Vanilla usage

```ts
import { flowField } from '@anarkisti/igyb/core';

const bg = flowField(document.querySelector('#hero')!, { theme: 'neon', interactive: true });
bg.start();
// bg.update({ theme: 'terminal' });  // live re-theme
// bg.destroy();                       // full teardown
```

## Svelte usage

```svelte
<script>
	import Background from '@anarkisti/igyb/svelte';
	import { plasma } from '@anarkisti/igyb/core';
</script>

<div style="height: 100vh">
	<Background pattern={plasma} options={{ theme: 'ink', interactive: true }} />
</div>
```

## Patterns

| Pattern    | Import (`@anarkisti/igyb/core`) | Renderer | Category   |
| ---------- | ------------------------------- | -------- | ---------- |
| Flow field | `flowField`                     | WebGL    | Generative |
| Plasma     | `plasma`                        | WebGL    | Generative |
| Particles  | `particles`                     | Canvas2D | Generative |
| Truchet    | `truchet`                       | Canvas2D | Geometric  |
| Hex        | `hex`                           | Canvas2D | Geometric  |
| Isometric  | `iso`                           | Canvas2D | Geometric  |

Deep imports keep bundles minimal even without tree-shaking:

```ts
import { flowField } from '@anarkisti/igyb/patterns/flow-field';
```

## Options

Every pattern accepts these on top of its own params:

| Option          | Type                                                   | Default     |
| --------------- | ------------------------------------------------------ | ----------- |
| `theme`         | `'ink' \| 'neon' \| 'pastel' \| 'terminal' \| Palette` | `'ink'`     |
| `animate`       | `boolean`                                              | `true`      |
| `speed`         | `number`                                               | `1`         |
| `interactive`   | `boolean`                                              | `false`     |
| `reducedMotion` | `'respect' \| 'off'`                                   | `'respect'` |
| `dpr`           | `number`                                               | auto        |

## Repo layout

```text
packages/
  igyb/              @anarkisti/igyb — core + runtime + patterns + <Background> wrapper
examples/
  svelte-gallery/    SvelteKit SPA playground → GitHub Pages
```

## Develop

Yarn is vendored (`.yarn/releases/*.cjs`, no corepack). Node version in `.node-version`.

```sh
yarn install
yarn dev          # run the gallery playground (patterns served from source, HMR)
yarn build        # build the package (Vite lib → dist) + the gallery
yarn validate     # lint + format + typecheck + test across the workspace
yarn size         # bundle-size budgets
```

## License

MIT © eetu
