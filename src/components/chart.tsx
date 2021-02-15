import { FC, MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import useAnimationFrame from "use-animation-frame";
import { useElementSize } from "../hooks/resize";
import { Color, HSVColor, lerpColorsRGB } from "../util/color";
import { clamp } from "../util/math";

const smoothness = 4;

const glowCutoff = 20;
const nyanCutoff = 400;

const TIME_DIVISOR = 10;
export function scoreFunction(time: number): number {
  return 2**(time / TIME_DIVISOR);
}

export function inverseScoreFunction(score: number): number {
  return Math.log2(score)*TIME_DIVISOR;
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

  const canvas = useRef() as MutableRefObject<HTMLCanvasElement>;

  const [
    x, y,
  ] = useMemo(() => [
    linearScale().domain([0, 10]).range([10, width - 10]),
    linearScale().domain([1, 2]).range([height - 10, 10]),
  ], [width, height]);

  useAnimationFrame((e) => {
    if (!canvas.current) return;
    if (!width || !height) return;

    const ctx = canvas.current.getContext("2d")!;

    ctx.clearRect(0, 0, 1000, 1000);

    ctx.beginPath();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    const currentScore = scoreFunction(e.time);

    if (e.time > x.inMax()) {
      x.domain([0, e.time]);
      y.domain([1, currentScore]);
    }

    ctx.moveTo(x(0), y(1));
    for (let i = 0; i < e.time && i < x.inMax(); i += Math.abs(x.inverse(x.min() + 1))/smoothness) {
      ctx.lineTo(x(i), y(scoreFunction(i)));
    }
    ctx.stroke();

    const shake = currentScore > nyanCutoff
      ? clamp(
          0, 3,
          (e.time - inverseScoreFunction(nyanCutoff))/5,
      ) * (Math.random() - 1) : 0;
    const text = currentScore.toFixed(2) + "X";

    ctx.font = "bold 48px Roboto";
    ctx.shadowBlur = 0;

    if (currentScore > nyanCutoff) {
      const c = new HSVColor(0, 0, 1);
      c.h = e.time % 1;
      c.s = clamp(0.001, 1, (e.time - inverseScoreFunction(nyanCutoff))/10);
      const col = c.asRGB().toString();

      const opacity = clamp(153, 255, 153 + (e.time - inverseScoreFunction(nyanCutoff))*5) | 0;
      ctx.fillStyle = col + opacity.toString(16);
    } else {
      ctx.fillStyle = "#ffffff99";
    }
    ctx.textAlign = "right";

    const shadowOpacity = clamp(8, 12, 8+(e.time - inverseScoreFunction(glowCutoff))*5);
    const shadowColor = lerpColorsRGB(
        [[0, "#000000"], [1, "#ffffff"]],
        e.time - inverseScoreFunction(glowCutoff),
    );

    ctx.shadowColor = shadowColor + "99";
    ctx.shadowBlur = shadowOpacity;

    const angle = 2*Math.PI*Math.random();
    ctx.fillText(text, x.max() + Math.cos(angle)*shake, y.min() + Math.sin(angle)*shake);

    ctx.closePath();
  });

  return (
    <div className="full-size" ref={el => setWrapper(el!)}>
      <canvas className="absolute" width={width} height={height} ref={canvas}></canvas>
    </div>
  );
};
