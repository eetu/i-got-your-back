<script lang="ts">
  import { untrack } from 'svelte';
  import type { Background, BackgroundFactory, BaseOptions } from '../types';

  type Props = {
    /** The pattern factory, e.g. `truchet` or `flowField`. */
    pattern: BackgroundFactory<any>;
    /** Options passed to the pattern; updated live when this changes. */
    options?: BaseOptions & Record<string, unknown>;
    /** Pause without destroying. */
    paused?: boolean;
    /** Extra classes for the host element. */
    class?: string;
  };

  let { pattern, options = {}, paused = false, class: className = '' }: Props = $props();

  let el: HTMLDivElement;
  let bg = $state<Background>();

  // (Re)create only when the pattern factory itself changes.
  $effect(() => {
    const factory = pattern;
    const instance = factory(
      el,
      untrack(() => options),
    );
    bg = instance;
    instance.start();
    return () => {
      instance.destroy();
      bg = undefined;
    };
  });

  // Push option changes (theme, params, animate…) without re-creating.
  $effect(() => {
    bg?.update(options);
  });

  // Pause / resume.
  $effect(() => {
    if (!bg) return;
    if (paused) bg.stop();
    else bg.start();
  });
</script>

<div bind:this={el} class="igyb-background {className}"></div>

<style>
  .igyb-background {
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>
