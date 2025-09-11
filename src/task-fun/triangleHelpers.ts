export function deg2rad(d: number) { return (Math.PI / 180) * d; }
export type Vertex = Readonly<{ x: number; y: number }>;

/** Vertices of an equilateral triangle centered at (cx,cy),
 *  with circumradius R, rotated by angleDeg. */
export function equilateralVertices(
  cx: number, cy: number,
  R: number, angleDeg: number
): Array<{ x: number; y: number }> {
  const a0 = deg2rad(angleDeg);
  const step = (2 * Math.PI) / 3; // 120°
  return [0, 1, 2].map(k => ({
    x: cx + R * Math.cos(a0 + k * step),
    y: cy + R * Math.sin(a0 + k * step),
  }));
}

/** Choose k unique indices from 0..(n-1) uniformly at random. */
export function pickK(n: number, k: number): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, Math.max(0, Math.min(k, n)));
}
