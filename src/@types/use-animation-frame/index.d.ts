declare module "use-animation-frame" {
  function useAnimationFrame(
    callback: (state: {
      time: number,
      delta: number
    }) => void,
    dependancies?: unknown[]
  ): void;

  export = useAnimationFrame;
}
