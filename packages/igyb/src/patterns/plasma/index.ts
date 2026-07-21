import {
	createShaderProgram,
	setPaletteUniforms,
	type ShaderProgram,
	SNOISE_2D
} from '../../renderers/webgl';
import { hexToRgb } from '../../runtime/color';
import { defineWebGL } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type PlasmaOptions = {
	/** World-space zoom. Default `3.5`. */
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
	float f = smoothstep(0.0, 1.0, fract(s));
	return mix(uAccents[i], uAccents[min(i + 1, uAccentCount - 1)], f);
}
void main() {
	vec2 uv = gl_FragCoord.xy / uResolution;
	float aspect = uResolution.x / uResolution.y;
	vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * uScale;
	vec2 m = (uPointer - 0.5) * vec2(aspect, 1.0) * uScale;
	p += (p - m) * uPointerActive * 0.15;
	float t = uTime * 0.35;
	// smooth, noise-driven flow (no harsh crisscross sine banding)
	float f = 0.6 * snoise(p * 0.8 + vec2(t * 0.3, 0.0)) + 0.4 * snoise(p * 1.7 - t * 0.2);
	f = f * 0.5 + 0.5 + 0.12 * sin(p.x * 0.7 + t);
	vec3 col = mix(uBg, accentRamp(clamp(f, 0.0, 1.0)), 0.92);
	fragColor = vec4(col, 1.0);
}`;

/** Smooth, noise-driven plasma that eases through the theme's accents. */
export const plasma: BackgroundFactory<PlasmaOptions> = defineWebGL<PlasmaOptions>({
	defaults: { scale: 3.5 },
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
		gl.uniform1f(prog.loc('uScale'), options.scale ?? 3.5);
		setPaletteUniforms(gl, prog, palette);
		const bg = hexToRgb(palette.bg);
		gl.clearColor(bg[0], bg[1], bg[2], 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
		prog.draw();
	}
});
