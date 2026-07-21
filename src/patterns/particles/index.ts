import { defineCanvas2D, type Canvas2DEnv } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type ParticlesOptions = {
  /** Particle density: approx. one particle per `spacing`² CSS pixels. Default `110`. */
  spacing?: number;
  /** Max distance (CSS px) at which two particles are linked. Default `130`. */
  linkDistance?: number;
  /** Pointer behaviour when interactive. Default `'attract'`. */
  pointerMode?: 'attract' | 'repel';
};

type Particle = { x: number; y: number; vx: number; vy: number };
type State = { particles: Particle[]; w: number; h: number };

function rebuild(env: Canvas2DEnv<ParticlesOptions>): State {
  const { surface, options } = env;
  const spacing = Math.max(30, (options.spacing ?? 110) * surface.dpr);
  const target = Math.round((surface.width * surface.height) / (spacing * spacing));
  const count = Math.max(24, Math.min(260, target));
  const speed = 18 * surface.dpr;
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * surface.width,
      y: Math.random() * surface.height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
    });
  }
  return { particles, w: surface.width, h: surface.height };
}

/**
 * Drifting particle field with a linked "constellation" mesh. When interactive, the
 * pointer attracts (or repels) nearby particles.
 */
export const particles: BackgroundFactory<ParticlesOptions> = defineCanvas2D<ParticlesOptions>({
  defaults: { spacing: 110, linkDistance: 130, pointerMode: 'attract' },
  setup(env) {
    const st = env.state.p as State | undefined;
    // Only rebuild when missing or the surface changed size — never on a theme tweak.
    if (!st || st.w !== env.surface.width || st.h !== env.surface.height) {
      env.state.p = rebuild(env);
    }
  },
  frame(env) {
    const { ctx, surface, palette, options, pointer, dt } = env;
    const st = (env.state.p ?? (env.state.p = rebuild(env))) as State;
    const dpr = surface.dpr;
    const link = (options.linkDistance ?? 130) * dpr;
    const link2 = link * link;
    const repel = options.pointerMode === 'repel';

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, surface.width, surface.height);

    const px = pointer.nx * surface.width;
    const py = pointer.ny * surface.height;
    const pull = surface.width * 0.18;
    const pull2 = pull * pull;

    for (const p of st.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (options.interactive && pointer.active) {
        const dx = px - p.x;
        const dy = py - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < pull2 && d2 > 1) {
          const f = ((1 - d2 / pull2) * 40 * dpr * dt) / Math.sqrt(d2);
          p.vx += dx * f * (repel ? -1 : 1);
          p.vy += dy * f * (repel ? -1 : 1);
        }
      }

      // gentle damping + wrap
      p.vx *= 0.995;
      p.vy *= 0.995;
      if (p.x < 0) p.x += surface.width;
      else if (p.x > surface.width) p.x -= surface.width;
      if (p.y < 0) p.y += surface.height;
      else if (p.y > surface.height) p.y -= surface.height;
    }

    // links
    ctx.lineWidth = dpr;
    for (let i = 0; i < st.particles.length; i++) {
      const a = st.particles[i];
      for (let j = i + 1; j < st.particles.length; j++) {
        const b = st.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > link2) continue;
        ctx.strokeStyle = palette.accent(0);
        ctx.globalAlpha = (1 - d2 / link2) * 0.5;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // dots
    ctx.globalAlpha = 1;
    ctx.fillStyle = palette.fg;
    const r = 1.6 * dpr;
    for (const p of st.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  },
});
