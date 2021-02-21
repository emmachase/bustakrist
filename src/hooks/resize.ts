import { useEffect, useState } from "react";

/**
 * Hook which returns the current size of the target element
 *
 * @param target - The element to watch
 */
export function useElementSize(target: HTMLElement | undefined, def?: {w: number, h: number})
: { w: number, h: number } {
  const [size, setSize] = useState(def ?? { w: 100, h: 100 });

  useEffect(() => {
    if (!target) return;

    const resizer = () => {
      setSize({
        w: target.clientWidth,
        h: target.clientHeight,
      });
    };

    const observer = new ResizeObserver(resizer);
    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [target]);

  return size;
}
