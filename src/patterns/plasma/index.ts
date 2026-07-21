import { hexToRgb } from '../../runtime/color';
import { defineWebGL } from '../../runtime/define';
import {
  createShaderProgram,
  setPaletteUniforms,
  SNOISE_2D,
  type ShaderProgram,
} from '../../renderers/webgl';
import type { BackgroundFactory } from '../../types';

export type PlasmaOptions = {
  /** World-space zoom. Default `4`. */
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
vec3 accentRamp(float x) {
  float n = float(max(uAccentCount, 1));
  float s = clamp(x, 0.0, 0.999) * n;
  int i = int(floor(s));
  float f = fract(s);
  return mix(uAccents[i], uAccents[min(i + 1, uAccentCount - 1)], f);
}
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * uScale;
  vec2 m = (uPointer - 0.5) * vec2(aspect, 1.0) * uScale;
  p += (p - m) * uPointerActive * 0.15;
  float t = uTime * 0.6;
  float v = 0.0;
  v += sin(p.x * 1.8 + t);
  v += sin(p.y * 1.9 - t * 1.1);
  v += sin((p.x + p.y) * 1.3 + t * 0.7);
  v += snoise(p * 0.9 + t * 0.2) * 1.5;
  v = v / 4.5 * 0.5 + 0.5;
  vec3 col = mix(uBg, accentRamp(v), 0.9);
  col += uFg * 0.06 * sin(v * 6.2831 + t);
  fragColor = vec4(col, 1.0);
}`;

/** Layered sine + noise plasma that cycles smoothly through the theme's accents. */
export const plasma: BackgroundFactory<PlasmaOptions> = defineWebGL<PlasmaOptions>({
  defaults: { scale: 4 },
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
    gl.uniform1f(prog.loc('uScale'), options.scale ?? 4);
    setPaletteUniforms(gl, prog, palette);
    const bg = hexToRgb(palette.bg);
    gl.clearColor(bg[0], bg[1], bg[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    prog.draw();
  },
});
