import {
	createShaderProgram,
	setPaletteUniforms,
	type ShaderProgram,
	SNOISE_2D} from '../../renderers/webgl';
import { hexToRgb } from '../../runtime/color';
import { defineWebGL } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type AuroraOptions = {
	/** World-space zoom of the curtains. Default `2`. */
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
	for (int i = 0; i < 4; i++) { s += a * snoise(p); p *= 2.0; a *= 0.5; }
	return s;
}
void main() {
	vec2 uv = gl_FragCoord.xy / uResolution;
	float t = uTime * 0.12;
	float px = uv.x + (uPointer.x - 0.5) * uPointerActive * 0.3;
	vec3 col = uBg;
	// three wavy, additive light curtains, one per accent
	for (int i = 0; i < 3; i++) {
		float fi = float(i);
		float cy = 0.30 + 0.20 * fi;
		float disp = 0.12 * fbm(vec2(px * (1.5 + fi) * uScale + t * (0.4 + 0.15 * fi) + fi * 7.0, fi * 3.1 + t * 0.2));
		float d = uv.y - (cy + disp);
		float glow = exp(-d * d * 90.0);
		col += uAccents[i] * glow * 0.9;
	}
	col *= 0.85 + 0.15 * uv.y;
	col = mix(col, uFg, smoothstep(1.6, 2.4, col.r + col.g + col.b) * 0.12);
	fragColor = vec4(col, 1.0);
}`;

/** Soft, wavy light curtains — a calm "northern lights" gradient field. */
export const aurora: BackgroundFactory<AuroraOptions> = defineWebGL<AuroraOptions>({
	defaults: { scale: 2 },
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
		gl.uniform1f(prog.loc('uScale'), options.scale ?? 2);
		setPaletteUniforms(gl, prog, palette);
		const bg = hexToRgb(palette.bg);
		gl.clearColor(bg[0], bg[1], bg[2], 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
		prog.draw();
	}
});
