import {
	createShaderProgram,
	setPaletteUniforms,
	type ShaderProgram,
	SNOISE_2D
} from '../../renderers/webgl';
import { hexToRgb } from '../../runtime/color';
import { defineWebGL } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type GradientMeshOptions = {
	/** Blob size / mesh zoom. Lower = larger, softer blends. Default `1.2`. */
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
	float aspect = uResolution.x / uResolution.y;
	vec2 p = vec2(uv.x * aspect, uv.y);
	float t = uTime * 0.14;
	// Organic warp so blob boundaries flow rather than sit in neat circles.
	vec2 warp = vec2(fbm(p * uScale + t), fbm(p * uScale + 5.2 - t)) * 0.34;
	vec2 q = p + warp;

	// Partition-of-unity blend of moving, per-accent colour blobs.
	vec3 acc = vec3(0.0);
	float total = 1e-4;
	for (int i = 0; i < 4; i++) {
		if (i >= uAccentCount) break;
		float fi = float(i);
		vec2 c = vec2(
			0.5 * aspect + 0.34 * aspect * sin(t * 0.7 + fi * 1.7),
			0.5 + 0.34 * cos(t * 0.6 + fi * 2.3)
		);
		if (i == 0) c += (uPointer - 0.5) * uPointerActive * 0.6 * vec2(aspect, 1.0);
		float d = distance(q, c);
		float w = exp(-d * d * 5.0 / uScale);
		acc += uAccents[i] * w;
		total += w;
	}
	vec3 mesh = acc / total;
	vec3 col = mix(uBg, mesh, 0.92);
	col *= 0.9 + 0.14 * fbm(q * 2.0 - t); // gentle luminance drift
	fragColor = vec4(clamp(col, 0.0, 1.2), 1.0);
}`;

/**
 * A lush animated mesh gradient — drifting blobs of the theme's accent colours blended into
 * a smooth field and warped by noise. The trendy "hero gradient" look; the pointer nudges the
 * first blob when `interactive`.
 */
export const gradientMesh: BackgroundFactory<GradientMeshOptions> =
	defineWebGL<GradientMeshOptions>({
		defaults: { scale: 1.2 },
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
			gl.uniform1f(prog.loc('uScale'), options.scale ?? 1.2);
			setPaletteUniforms(gl, prog, palette);
			const bg = hexToRgb(palette.bg);
			gl.clearColor(bg[0], bg[1], bg[2], 1);
			gl.clear(gl.COLOR_BUFFER_BIT);
			prog.draw();
		}
	});
