export function clamp(min: number, max: number, x: number): number {
  return Math.min(Math.max(x, min), max);
}

export function shuffle<T>(xs: T[]): T[] {
  for (let i = xs.length - 1; i >= 1; i--) {
    const j = Math.floor((i + 1)*Math.random());
    [xs[i], xs[j]] = [xs[j], xs[i]];
  }

  return xs;
}
