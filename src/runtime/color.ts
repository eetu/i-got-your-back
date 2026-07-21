/** Parse a `#rgb` / `#rrggbb` hex string into normalized `[r, g, b]` (0–1). */
export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const n = Number.parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
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
