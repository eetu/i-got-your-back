import {
	createShaderProgram,
	setPaletteUniforms,
	type ShaderProgram,
	SNOISE_2D
} from '../../renderers/webgl';
import { hexToRgb } from '../../runtime/color';
import { defineWebGL } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type AuroraOptions = {
	/** World-space zoom of the curtains. Default `1.5`. */
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
	for (int i = 0; i < 3; i++) { s += a * snoise(p); p *= 2.0; a *= 0.5; }
	return s;
}
void main() {
	vec2 uv = gl_FragCoord.xy / uResolution;
	float t = uTime * 0.08;
	float y = 1.0 - uv.y;                          // 0 at bottom, 1 at top
	float shift = (uPointer.x - 0.5) * uPointerActive * 0.4;
	vec3 col = uBg;
	// three soft, wispy vertical curtains, staggered in height, one per accent
	for (int i = 0; i < 3; i++) {
		float fi = float(i);
		float x = (uv.x + shift) * (1.3 + fi * 0.7) * uScale + t * (0.4 + 0.15 * fi) + fi * 13.0;
		float n = fbm(vec2(x, t * 0.5 + fi * 3.0));
		float h = 0.5 + 0.22 * fi + 0.16 * n;        // wispy top height
		float band = smoothstep(h, h - 0.5, y) * smoothstep(0.0, 0.14, y);
		float curtain = 0.35 + 0.65 * smoothstep(-0.2, 0.6, n);
		float ray = 0.88 + 0.12 * sin(x * 4.0);
		col += uAccents[i] * band * curtain * ray * 0.6;
	}
	col = clamp(col, 0.0, 1.3);
	fragColor = vec4(col, 1.0);
}`;

/** Soft, wispy vertical light curtains — a calm "northern lights" gradient field. */
export const aurora: BackgroundFactory<AuroraOptions> = defineWebGL<AuroraOptions>({
	defaults: { scale: 1.5 },
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
		gl.uniform1f(prog.loc('uScale'), options.scale ?? 1.5);
		setPaletteUniforms(gl, prog, palette);
		const bg = hexToRgb(palette.bg);
		gl.clearColor(bg[0], bg[1], bg[2], 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
		prog.draw();
	}
});
