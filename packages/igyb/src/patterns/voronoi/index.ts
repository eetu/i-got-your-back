import { createShaderProgram, setPaletteUniforms, type ShaderProgram } from '../../renderers/webgl';
import { hexToRgb } from '../../runtime/color';
import { defineWebGL } from '../../runtime/define';
import type { BackgroundFactory } from '../../types';

export type VoronoiOptions = {
	/** Roughly the number of cells across. Default `5`. */
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
vec2 hash2(vec2 p) {
	p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
	return fract(sin(p) * 43758.5453);
}
float hash1(vec2 p) {
	return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453);
}
// animated feature point within cell 'c' — a gentle orbit that stays clear of the
// cell edges so neighbouring points never bunch up.
vec2 vpoint(vec2 c) {
	vec2 o = hash2(c);
	return 0.5 + 0.34 * sin(uTime * 0.4 + 6.2831 * o + vec2(0.0, 1.5707));
}
void main() {
	vec2 uv = gl_FragCoord.xy / uResolution;
	float aspect = uResolution.x / uResolution.y;
	vec2 p = vec2(uv.x * aspect, uv.y) * uScale;
	p += (vec2(uPointer.x * aspect, uPointer.y) * uScale - p) * uPointerActive * 0.12;
	vec2 ip = floor(p), fp = fract(p);
	// pass 1 — nearest feature point
	vec2 mg = vec2(0.0), mr = vec2(0.0);
	float md = 8.0;
	for (int j = -1; j <= 1; j++) {
		for (int i = -1; i <= 1; i++) {
			vec2 g = vec2(float(i), float(j));
			vec2 r = g + vpoint(ip + g) - fp;
			float d = dot(r, r);
			if (d < md) { md = d; mr = r; mg = g; }
		}
	}
	// pass 2 — distance to the nearest cell edge (Inigo Quilez): gives crisp,
	// uniform-width seams regardless of how close two points drift.
	float edge = 8.0;
	for (int j = -2; j <= 2; j++) {
		for (int i = -2; i <= 2; i++) {
			vec2 g = mg + vec2(float(i), float(j));
			vec2 r = g + vpoint(ip + g) - fp;
			vec2 diff = r - mr;
			if (dot(diff, diff) > 0.00001) {
				edge = min(edge, dot(0.5 * (mr + r), normalize(diff)));
			}
		}
	}
	float border = smoothstep(0.0, 0.035, edge);
	float hh = hash1(ip + mg);
	vec3 cell = mix(uAccents[0], uAccents[min(1, uAccentCount - 1)], hh);
	cell = mix(cell, uAccents[min(2, uAccentCount - 1)], smoothstep(0.6, 1.0, hh));
	vec3 col = mix(uBg, cell, border);
	fragColor = vec4(col, 1.0);
}`;

/** Shifting Voronoi cells with clean seams. The pointer drags the cell field. */
export const voronoi: BackgroundFactory<VoronoiOptions> = defineWebGL<VoronoiOptions>({
	defaults: { scale: 5 },
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
		gl.uniform1f(prog.loc('uScale'), options.scale ?? 5);
		setPaletteUniforms(gl, prog, palette);
		const bg = hexToRgb(palette.bg);
		gl.clearColor(bg[0], bg[1], bg[2], 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
		prog.draw();
	}
});
