import i18next from "i18next";

const TIME_DIVISOR = 10;
export function scoreFunction(time: number): number {
  return 2**(time / TIME_DIVISOR);
}

export function inverseScoreFunction(score: number): number {
  return Math.log2(score)*TIME_DIVISOR;
}

export function formatScore(num: number): string {
  return num.toLocaleString(i18next.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatFixed2(num: number): string {
  return formatScore(num / 100);
}
