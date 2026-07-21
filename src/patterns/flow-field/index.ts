import { hexToRgb } from '../../runtime/color';
import { defineWebGL } from '../../runtime/define';
import {
  createShaderProgram,
  setPaletteUniforms,
  SNOISE_2D,
  type ShaderProgram,
} from '../../renderers/webgl';
import type { BackgroundFactory } from '../../types';

export type FlowFieldOptions = {
  /** World-space zoom; larger = more, finer detail. Default `3`. */
  scale?: number;
};

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uScale;
uniform vec3 uBg;
uniform vec3 uFg;
uniform vec3 uAccents[4];
uniform int uAccentCount;
out vec4 fragColor;
${SNOISE_2D}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * snoise(p); p *= 2.0; a *= 0.5; }
  return s;
}
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * uScale;
  vec2 m = (uPointer - 0.5) * vec2(aspect, 1.0) * uScale;
  float md = length(p - m);
  p += normalize(p - m + 1e-4) * uPointerActive * exp(-md * 1.5) * 0.6;
  float t = uTime * 0.15;
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 2.0 * q + vec2(1.7, 9.2) + 0.5 * t), fbm(p + 2.0 * q + vec2(8.3, 2.8) - 0.5 * t));
  float f = fbm(p + 2.5 * r) * 0.5 + 0.5;
  float ql = clamp(length(q) * 0.5, 0.0, 1.0);
  vec3 col = uBg;
  col = mix(col, uAccents[0], smoothstep(0.1, 0.9, f));
  col = mix(col, uAccents[1], ql * 0.6);
  col = mix(col, uAccents[min(2, uAccentCount - 1)], smoothstep(0.6, 1.0, f) * 0.5);
  col = mix(col, uFg, smoothstep(0.85, 1.05, f) * 0.15);
  fragColor = vec4(col, 1.0);
}`;

/** Domain-warped simplex-noise field — a flowing, marbled generative background. */
export const flowField: BackgroundFactory<FlowFieldOptions> = defineWebGL<FlowFieldOptions>({
  defaults: { scale: 3 },
  setup(env) {
    const st = env.state as { prog?: ShaderProgram };
    if (!st.prog) st.prog = createShaderProgram(env.gl, FRAG);
  },
  frame(env) {
    const { gl, surface, palette, options, pointer, time } = env;
    const prog = (env.state as { prog?: ShaderProgram }).prog;
    if (!prog) return;
    prog.use();
    gl.uniform2f(prog.loc('uResolution'), surface.width, surface.height);
    gl.uniform1f(prog.loc('uTime'), time);
    gl.uniform2f(prog.loc('uPointer'), pointer.nx, 1 - pointer.ny);
    gl.uniform1f(prog.loc('uPointerActive'), options.interactive && pointer.active ? 1 : 0);
    gl.uniform1f(prog.loc('uScale'), options.scale ?? 3);
    setPaletteUniforms(gl, prog, palette);
    const bg = hexToRgb(palette.bg);
    gl.clearColor(bg[0], bg[1], bg[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    prog.draw();
  },
});
