export function clamp(min: number, max: number, x: number): number {
  return Math.min(Math.max(x, min), max);
}
