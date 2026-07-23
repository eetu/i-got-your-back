/**
 * Parse a `#rgb` / `#rrggbb` hex or `rgb()`/`rgba()` string into normalized `[r, g, b]` (0–1).
 * Accepts `rgb()` too so WebGL patterns keep working through a theme crossfade (which produces
 * interpolated `rgb()` colors).
 */
export function hexToRgb(hex: string): [number, number, number] {
	const [r, g, b] = toRgb(hex);
	return [r / 255, g / 255, b / 255];
}

/** Multiply a hex color's brightness by `f` (clamped), returning a `rgb(...)` string. */
export function shade(hex: string, f: number): string {
	const [r, g, b] = hexToRgb(hex);
	const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * 255 * f)));
	return `rgb(${c(r)}, ${c(g)}, ${c(b)})`;
}

/** Linearly interpolate between two hex colors, returning a `rgb(...)` string. */
export function mixHex(a: string, b: string, t: number): string {
	const A = hexToRgb(a);
	const B = hexToRgb(b);
	const m = (i: number) => Math.round((A[i] + (B[i] - A[i]) * t) * 255);
	return `rgb(${m(0)}, ${m(1)}, ${m(2)})`;
}

// --- Public color helpers (0–255 integer space) ---------------------------------
// Ergonomic utilities for consumers drawing their own glyphs/marks against a themed
// palette. Distinct from `hexToRgb` above, which stays in 0–1 space for WebGL uniforms.

function clamp255(v: number): number {
	return Math.max(0, Math.min(255, Math.round(v)));
}

/** Parse a `#rgb`/`#rrggbb` hex or a `rgb()`/`rgba()` string into integer `[r, g, b]` (0–255). */
export function toRgb(color: string): [number, number, number] {
	const s = color.trim();
	if (s.startsWith('#')) {
		let h = s.slice(1);
		if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
		const n = Number.parseInt(h, 16);
		return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
	}
	const m = s.match(/[\d.]+/g);
	if (m && m.length >= 3) return [clamp255(+m[0]), clamp255(+m[1]), clamp255(+m[2])];
	return [0, 0, 0];
}

/** Format an `[r, g, b]` triplet (rounded & clamped to 0–255) as a `rgb(...)` string. */
export function toRgbString(rgb: [number, number, number]): string {
	return `rgb(${clamp255(rgb[0])}, ${clamp255(rgb[1])}, ${clamp255(rgb[2])})`;
}

/** Mix two colors (hex or `rgb()` strings) by `t` (0 → `a`, 1 → `b`); returns `rgb(...)`. */
export function mix(a: string, b: string, t: number): string {
	const A = toRgb(a);
	const B = toRgb(b);
	return toRgbString([
		A[0] + (B[0] - A[0]) * t,
		A[1] + (B[1] - A[1]) * t,
		A[2] + (B[2] - A[2]) * t
	]);
}

/** Lighten a color toward white by `t` (0–1); returns `rgb(...)`. */
export function lighten(color: string, t: number): string {
	return mix(color, '#ffffff', t);
}

/** Darken a color toward black by `t` (0–1); returns `rgb(...)`. */
export function darken(color: string, t: number): string {
	return mix(color, '#000000', t);
}
