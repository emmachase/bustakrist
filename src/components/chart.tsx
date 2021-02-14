import { FC, MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import useAnimationFrame from "use-animation-frame";

export const BustChart: FC<{

}> = (props) => {
  // const [_, refresh] = useState(0);
  // const data = useRef<{val: number}[]>([]);

  const canvas = useRef() as MutableRefObject<HTMLCanvasElement>;

  // console.log("r");
  useAnimationFrame((e) => {
    if (!canvas.current) return;

    const ctx = canvas.current.getContext("2d");
    
  });

  return (
  // <ResponsiveContainer width="100%" height="100%">
    /* <LineChart data={[...data.current]}>
        <Line isAnimationActive={false} dot={false} strokeWidth={3}
          type="monotone" dataKey="val" stroke="#8884d899" />
        <XAxis stroke="#ffffff44" />
        <YAxis stroke="#ffffff44" />
      </LineChart> */
    // </ResponsiveContainer>
    <canvas ref={canvas}></canvas>
  );
};
