import { useEffect, useState } from "react";

/**
 * Hook which returns the current size of the target element
 *
 * @param target - The element to watch
 */
export function useElementSize(target: HTMLElement | undefined)
: { w: number, h: number } {
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!target) return;

    const observer = new ResizeObserver(() => {
      setSize({
        w: target.clientWidth,
        h: target.clientHeight,
      });
    });

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [target]);

  return size;
}
