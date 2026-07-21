# I Got Your Back

Tree-shakeable repeating & generative **backgrounds** for the web — geometric tiles and
WebGL generative art. A framework-agnostic core (Canvas2D + WebGL) with a thin Svelte wrapper.

### ▶ [Live playground →](https://eetu.github.io/i-got-your-back/)

> The playground goes live after the first push to `main` (GitHub Pages / Actions).

- **Tree-shakeable** — import only the patterns you use. `sideEffects: false`, unbundled ESM.
- **Themed** — four built-in palettes or bring your own; swap live.
- **Animated & interactive** — RAF loop, pointer reactions, per-pattern params.
- **Accessible** — honors `prefers-reduced-motion` (freezes to a static frame) out of the box.
- **Framework-agnostic core** — a Svelte wrapper today; React/Vue are ~30 lines away.

## Install

```sh
pnpm add i-got-your-back
```

## Vanilla usage

```ts
import { flowField } from 'i-got-your-back';

const bg = flowField(document.querySelector('#hero')!, {
  theme: 'neon',
  interactive: true,
});
bg.start();
// bg.update({ theme: 'terminal' });  // live re-theme
// bg.destroy();                       // full teardown
```

Any host element works — the pattern mounts a DPR-scaled canvas that fills it and follows resizes.

## Svelte usage

```svelte
<script>
  import Background from 'i-got-your-back/svelte';
  import { plasma } from 'i-got-your-back';
</script>

<div style="height: 100vh">
  <Background pattern={plasma} options={{ theme: 'ink', interactive: true }} />
</div>
```

## Patterns

| Pattern    | Import      | Renderer | Category   |
| ---------- | ----------- | -------- | ---------- |
| Flow field | `flowField` | WebGL    | Generative |
| Plasma     | `plasma`    | WebGL    | Generative |
| Particles  | `particles` | Canvas2D | Generative |
| Truchet    | `truchet`   | Canvas2D | Geometric  |
| Hex        | `hex`       | Canvas2D | Geometric  |
| Isometric  | `iso`       | Canvas2D | Geometric  |

Deep imports keep bundles minimal even without tree-shaking:

```ts
import { flowField } from 'i-got-your-back/patterns/flow-field';
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

Custom palette:

```ts
import { hex } from 'i-got-your-back';

hex(el, { theme: { bg: '#100c1c', fg: '#fff', accents: ['#ff477e', '#ffd166'] } });
```

## Authoring a pattern

```ts
import { defineCanvas2D } from 'i-got-your-back';

export const stripes = defineCanvas2D<{ width?: number }>({
  defaults: { width: 20 },
  frame({ ctx, surface, palette, time, options }) {
    /* draw one frame */
  },
});
```

`defineWebGL` is the same shape with a `gl` (WebGL2) context. Cache resources in `env.state`.

## Develop

```sh
pnpm install
pnpm dev          # runs the demo playground with HMR (patterns served from source)
pnpm build        # emit the library to dist/ (tsc, unbundled ESM + types)
pnpm build:demo   # build the playground to demo/dist
```

## License

MIT © eetu
