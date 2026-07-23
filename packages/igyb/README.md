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

## Web component (any framework)

`<igyb-background>` resolves a pattern by name from the registry — drop it into plain HTML,
React, Vue, anything:

```ts
import { register } from '@anarkisti/igyb/element';
register(); // defines <igyb-background> once
```

```html
<igyb-background pattern="gradientMesh" theme="sunset" interactive
	style="display:block; inline-size:100%; block-size:100vh"></igyb-background>
```

## React

Use `<igyb-background>` above, or this ~20-line wrapper that takes a tree-shakeable factory:

```tsx
import { useEffect, useRef } from 'react';
import type { AnyBackgroundFactory, BaseOptions } from '@anarkisti/igyb/core';

export function Background({
	pattern,
	options,
	paused
}: {
	pattern: AnyBackgroundFactory;
	options?: BaseOptions & Record<string, unknown>;
	paused?: boolean;
}) {
	const host = useRef<HTMLDivElement>(null);
	const bg = useRef<ReturnType<AnyBackgroundFactory>>();
	useEffect(() => {
		bg.current = pattern(host.current!, options);
		if (!paused) bg.current.start();
		return () => bg.current?.destroy();
	}, [pattern]); // eslint-disable-line react-hooks/exhaustive-deps
	useEffect(() => bg.current?.update(options ?? {}), [options]);
	useEffect(() => (paused ? bg.current?.stop() : bg.current?.start()), [paused]);
	return <div ref={host} style={{ position: 'relative', width: '100%', height: '100%' }} />;
}
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
`pointerSource`, `reducedMotion` and `dpr`. Themes: `ink` (default), `neon`, `pastel`,
`terminal`, `mono`, `paper`, `halo`, or a custom `Palette`. See the repo root README for the
full option table.

## Theming from CSS variables

For token-driven apps, read the palette straight from CSS custom properties and pass `theme`
as a **thunk**. On a light/dark flip, call `bg.refresh()` — it re-invokes the thunk and
repaints in place, no teardown:

```ts
import { glyphTile, paletteFromCSS } from '@anarkisti/igyb/core';

const map = { bg: '--surface', fg: '--ink', accents: ['--accent'] };
const bg = glyphTile(el, { theme: () => paletteFromCSS(map) });
bg.start();

// when your theme toggles (after the new tokens land on the element):
bg.refresh();
```

Drawing your own glyph/marks? The `glyphTile` callback receives the resolved `palette`, and
`@anarkisti/igyb/core` exports small color helpers so you don't re-roll them:

```ts
import { lighten, mix, toRgb } from '@anarkisti/igyb/core';

glyphTile(el, {
	glyph(ctx, size, i, { palette, highlight }) {
		ctx.strokeStyle = mix(palette.fg, lighten(palette.fg, 0.8), highlight); // reacts to the pointer
		ctx.strokeRect(-size / 4, -size / 4, size / 2, size / 2);
	}
});
```

`toRgb` / `toRgbString`, `mix`, `lighten`, `darken` accept hex or `rgb()` strings.

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
