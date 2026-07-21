import {
	createShaderProgram,
	setPaletteUniforms,
	type ShaderProgram,
	SNOISE_2D
} from '../../renderers/webgl';
import { hexToRgb } from '../../runtime/color';
import { defineWebGL } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type FlowFieldOptions = {
	/** World-space zoom; larger = more, finer detail. Default `1.8`. */
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
	float aspect = uResolution.x / uResolution.y;
	vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * uScale;
	vec2 m = (uPointer - 0.5) * vec2(aspect, 1.0) * uScale;
	p += (p - m) * uPointerActive * exp(-length(p - m)) * 0.4;
	float t = uTime * 0.05;
	// one gentle domain-warp → big, calm, marbled regions (not high-freq noise)
	vec2 q = vec2(fbm(p + t), fbm(p + vec2(3.1, 1.7) - t));
	float f = fbm(p + 1.4 * q) * 0.5 + 0.5;
	vec3 col = mix(uBg, uAccents[0], smoothstep(0.2, 0.85, f));
	col = mix(col, uAccents[1], smoothstep(0.55, 1.0, f) * 0.5);
	col = mix(col, uFg, smoothstep(0.92, 1.05, f) * 0.06);
	fragColor = vec4(col, 1.0);
}`;

/** Domain-warped simplex noise — a slow, calm, marbled generative field. */
export const flowField: BackgroundFactory<FlowFieldOptions> = defineWebGL<FlowFieldOptions>({
	defaults: { scale: 1.8 },
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
		gl.uniform1f(prog.loc('uScale'), options.scale ?? 1.8);
		setPaletteUniforms(gl, prog, palette);
		const bg = hexToRgb(palette.bg);
		gl.clearColor(bg[0], bg[1], bg[2], 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
		prog.draw();
	}
});
