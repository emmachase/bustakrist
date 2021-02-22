import { useMemo } from "react";

export function usePerfOff() {
  return useMemo(() => +new Date() - performance.now(), []);
}

export function getTimeDiff(perfOff: number, start: number, tdiff: number) {
  return (performance.now() + perfOff - start - tdiff)/1000;
}
