import { FC, MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import useAnimationFrame from "use-animation-frame";
import { useElementSize } from "../hooks/resize";
import { Color, HSVColor } from "../util/color";

const nyanCutoff = 1.5;

export function scoreFunction(time: number): number {
  return 2**(time / 10);
}

function linearScale() {
  const domain = [0, 0];
  const range = [0, 0];

  const scale = function scale(value: number) {
    const alpha = (value - domain[0]) / (domain[1] - domain[0]);
    return range[0] + alpha*(range[1] - range[0]);
  };

  scale.domain = function([a, b]: [number, number]) {
    domain[0] = a;
    domain[1] = b;

    return this;
  };

  scale.range = function([a, b]: [number, number]) {
    range[0] = a;
    range[1] = b;

    return this;
  };

  scale.inverse = function(value: number) {
    const alpha = (value - range[0]) / (range[1] - range[0]);
    return domain[0] + alpha*(domain[1] - domain[0]);
  };

  scale.inMin = () => domain[0];
  scale.inMax = () => domain[1];
  scale.min = () => range[0];
  scale.max = () => range[1];

  return scale;
}

export const BustChart: FC<{

}> = (props) => {
  const [wrapper, setWrapper] = useState<HTMLElement>();
  const { w: width, h: height } = useElementSize(wrapper);
  // const [_, refresh] = useState(0);
  // const data = useRef<{val: number}[]>([]);

  const canvas = useRef() as MutableRefObject<HTMLCanvasElement>;

  const [
    x, y,
  ] = useMemo(() => [
    linearScale().domain([0, 10]).range([0, width]),
    linearScale().domain([1, 2]).range([height, 0]),
  ], [width, height]);

  // console.log("r");
  useAnimationFrame((e) => {
    if (!canvas.current) return;

    const ctx = canvas.current.getContext("2d")!;

    ctx.clearRect(0, 0, 1000, 1000);

    ctx.beginPath();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 5;

    const currentScore = scoreFunction(e.time);

    if (e.time > x.inMax()) {
      x.domain([0, e.time]);
      y.domain([1, currentScore]);
    }

    ctx.moveTo(x(0), y(1));
    for (let i = 0; i < e.time && i < x.inMax(); i += x.inverse(1)) {
      ctx.lineTo(x(i), y(scoreFunction(i)));
    }
    ctx.stroke();

    // ctx.font = "24pt serif";
    // ctx.fillText((2**(e.time/10)).toFixed(2), 0, 0);
    ctx.font = "bold 48px Roboto";
    if (currentScore > nyanCutoff) {
      const c = new HSVColor(0, 1, 1);
      c.h = e.time % 1;
      ctx.fillStyle = c.asRGB().toString();
    } else {
      ctx.fillStyle = "#ffffff99";
    }
    ctx.textAlign = "right";
    const shake = currentScore > nyanCutoff ? (Math.random() - 1)*e.time : 0;
    ctx.fillText(currentScore.toFixed(2) + "X", x.max() + shake, y.min());


    ctx.closePath();
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
    <div className="full-size" ref={el => setWrapper(el!)}>
      <canvas className="absolute" width={width} height={height} ref={canvas}></canvas>
    </div>
  );
};
