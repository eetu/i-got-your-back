import { createShaderProgram, setPaletteUniforms, type ShaderProgram } from '../../renderers/webgl';
import { hexToRgb } from '../../runtime/color';
import { defineWebGL } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type MetaballsOptions = {
	/** Blob size multiplier. Default `1`. */
	size?: number;
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
void main() {
	vec2 uv = gl_FragCoord.xy / uResolution;
	float aspect = uResolution.x / uResolution.y;
	vec2 p = vec2(uv.x * aspect, uv.y);
	float t = uTime * 0.3;
	float field = 0.0;
	for (int i = 0; i < 6; i++) {
		float fi = float(i);
		vec2 c = vec2(
			aspect * (0.5 + 0.36 * sin(t * (0.5 + 0.11 * fi) + fi * 1.7)),
			0.5 + 0.34 * cos(t * (0.43 + 0.09 * fi) + fi * 2.3)
		);
		float r = (0.12 + 0.02 * sin(fi)) * uScale;
		vec2 d = p - c;
		field += (r * r) / (dot(d, d) + 0.0002);
	}
	vec2 pc = vec2(uPointer.x * aspect, uPointer.y);
	vec2 dp = p - pc;
	field += uPointerActive * 0.02 / (dot(dp, dp) + 0.001);
	float inside = smoothstep(0.9, 1.15, field);
	float rim = smoothstep(0.7, 1.0, field) - smoothstep(1.0, 1.5, field);
	vec3 col = mix(uBg, uAccents[0], inside);
	col = mix(col, uAccents[min(1, uAccentCount - 1)], smoothstep(1.3, 3.0, field) * 0.7);
	col += uFg * rim * 0.18;
	fragColor = vec4(col, 1.0);
}`;

/** Gooey merging blobs (a classic metaball isosurface). The pointer adds a blob. */
export const metaballs: BackgroundFactory<MetaballsOptions> = defineWebGL<MetaballsOptions>({
	defaults: { size: 1 },
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
		gl.uniform1f(prog.loc('uScale'), options.size ?? 1);
		setPaletteUniforms(gl, prog, palette);
		const bg = hexToRgb(palette.bg);
		gl.clearColor(bg[0], bg[1], bg[2], 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
		prog.draw();
	}
});
