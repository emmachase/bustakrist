/**
 * Returns the major interval (rate at which axis ticks are drawn) for a given axis
 *
 * @param axisMin - The lowest point drawn on this axis (0 for time, 1 for multiplier)
 * @param axisMax - The highest point drawn on this axis (the greater of 10 or time, or the greater of 2 or multiplier)
 */
export function getMajorInterval(axisMin: number, axisMax: number): number {
  const range = axisMax - axisMin;
  let interval = 0.2;
  for (let idx = 0; interval < range / 6; idx ++)
    interval *= idx % 3 > 0 ? 2 : 2.5;
  return interval;
}
