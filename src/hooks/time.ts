import { useMemo, useEffect, useState, useCallback, useRef } from "react";

export function usePerfOff() {
  return useMemo(() => +new Date() - performance.now(), []);
}

export function getTimeDiff(perfOff: number, start: number, tdiff: number) {
  return (performance.now() + perfOff - start - tdiff)/1000;
}

const defaultOptions = {
  cancelOnUnmount: true,
};

export const useRecurTimeout = (fn: () => void, milliseconds: number, options = defaultOptions) => {
  const opts = { ...defaultOptions, ...(options || {}) };
  const timeout = useRef<number>();
  const callback = useRef(fn);
  const resetCallback = useRef<() => void>();
  const [isCleared, setIsCleared] = useState(false);

  // the clear method
  const clear = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      setIsCleared(true);
    }
  }, []);

  // if the provided function changes, change its reference
  useEffect(() => {
    if (typeof fn === "function") {
      callback.current = fn;
    }
  }, [fn]);

  resetCallback.current = () => {
    if (typeof milliseconds === "number") {
      timeout.current = window.setTimeout(() => {
        callback.current();
        resetCallback.current?.();
      }, milliseconds);
    }
  };

  // when the milliseconds change, reset the timeout
  useEffect(() => {
    resetCallback.current?.();
    return clear;
  }, [milliseconds]);

  // when component unmount clear the timeout
  useEffect(() => () => {
    if (opts.cancelOnUnmount) {
      clear();
    }
  }, []);

  return [isCleared, clear];
};
