# @anarkisti/igyb

Tree-shakeable repeating & generative **backgrounds** — geometric tiles and WebGL generative
art. A framework-agnostic core (Canvas2D + WebGL) with a thin Svelte wrapper.

### ▶ [Live playground →](https://eetu.github.io/i-got-your-back/)

```sh
yarn add @anarkisti/igyb
```

## Vanilla

```ts
import { flowField } from '@anarkisti/igyb/core';

const bg = flowField(document.querySelector('#hero')!, { theme: 'neon', interactive: true });
bg.start();
// bg.update({ theme: 'terminal' });  // live re-theme
// bg.destroy();
```

## Svelte

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

| Pattern     | Import (`@anarkisti/igyb/core`) | Renderer | Category   |
| ----------- | ------------------------------- | -------- | ---------- |
| Flow field  | `flowField`                     | WebGL    | Generative |
| Plasma      | `plasma`                        | WebGL    | Generative |
| Aurora      | `aurora`                        | WebGL    | Generative |
| Particles   | `particles`                     | Canvas2D | Generative |
| Matrix rain | `matrixRain`                    | Canvas2D | Generative |
| Starfield   | `starfield`                     | Canvas2D | Generative |
| Truchet     | `truchet`                       | Canvas2D | Geometric  |
| Hex         | `hex`                           | Canvas2D | Geometric  |
| Isometric   | `iso`                           | Canvas2D | Geometric  |
| Dot grid    | `dotGrid`                       | Canvas2D | Geometric  |

Deep imports (`@anarkisti/igyb/patterns/flow-field`) keep bundles minimal even without
tree-shaking. Every pattern also takes `theme`, `animate`, `speed`, `interactive`,
`reducedMotion` and `dpr`. Themes: `ink` (default), `neon`, `pastel`, `terminal`, `mono`,
`paper`, `halo`, or a custom `Palette`. See the repo root README for the full option table.

## Authoring

```ts
import { defineCanvas2D } from '@anarkisti/igyb/core';

export const stripes = defineCanvas2D<{ width?: number }>({
	defaults: { width: 20 },
	frame({ ctx, surface, palette, time, options }) {
		/* draw one frame */
	}
});
```

`defineWebGL` is the same shape with a WebGL2 `gl` context. Cache resources in `env.state`.
