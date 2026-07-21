import { hexToRgb } from '../runtime/color';
import type { ResolvedPalette } from '../runtime/theme';

/** Vertex shader that emits a single screen-covering triangle. */
export const FULLSCREEN_VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

/**
 * Ashima Arts 2D simplex noise (public domain / MIT). Returns ~[-1, 1].
 * Paste into a fragment shader body via `${SNOISE_2D}`.
 */
export const SNOISE_2D = `
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}`;

export type ShaderProgram = {
	use(): void;
	loc(name: string): WebGLUniformLocation | null;
	draw(): void;
};

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
	const shader = gl.createShader(type);
	if (!shader) throw new Error('[igyb] could not create shader');
	gl.shaderSource(shader, src);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(`[igyb] shader compile failed: ${log ?? 'unknown'}`);
	}
	return shader;
}

/** Compile + link a fragment shader against the fullscreen vertex shader. */
export function createShaderProgram(
	gl: WebGL2RenderingContext,
	frag: string,
	vert: string = FULLSCREEN_VERT
): ShaderProgram {
	const program = gl.createProgram();
	if (!program) throw new Error('[igyb] could not create program');
	gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vert));
	gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, frag));
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(`[igyb] program link failed: ${gl.getProgramInfoLog(program) ?? 'unknown'}`);
	}

	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
	const aPos = gl.getAttribLocation(program, 'aPos');
	gl.enableVertexAttribArray(aPos);
	gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
	gl.bindVertexArray(null);

	const cache = new Map<string, WebGLUniformLocation | null>();

	return {
		use() {
			gl.useProgram(program);
			gl.bindVertexArray(vao);
		},
		loc(name) {
			let l = cache.get(name);
			if (l === undefined) {
				l = gl.getUniformLocation(program, name);
				cache.set(name, l);
			}
			return l;
		},
		draw() {
			gl.drawArrays(gl.TRIANGLES, 0, 3);
		}
	};
}

/**
 * Upload palette colors as the conventional uniforms:
 * `uBg`, `uFg` (vec3), `uAccents[4]` (vec3), `uAccentCount` (int).
 */
export function setPaletteUniforms(
	gl: WebGL2RenderingContext,
	prog: ShaderProgram,
	palette: ResolvedPalette
): void {
	const bg = hexToRgb(palette.bg);
	const fg = hexToRgb(palette.fg);
	gl.uniform3f(prog.loc('uBg'), bg[0], bg[1], bg[2]);
	gl.uniform3f(prog.loc('uFg'), fg[0], fg[1], fg[2]);

	const flat = new Float32Array(12);
	for (let i = 0; i < 4; i++) {
		const c = hexToRgb(palette.accent(i));
		flat.set(c, i * 3);
	}
	gl.uniform3fv(prog.loc('uAccents'), flat);
	gl.uniform1i(prog.loc('uAccentCount'), Math.min(4, palette.accents.length));
}
