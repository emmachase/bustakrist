import { FC, MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useStore } from "react-redux";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import useAnimationFrame from "use-animation-frame";
import { useElementSize } from "../hooks/resize";
import { getConnection } from "../meta/connection";
import { RootState } from "../store/reducers/RootReducer";
import { getMajorInterval } from "../util/axis";
import { Color, HSVColor, lerpColorsRGB } from "../util/color";
import { clamp } from "../util/math";

const smoothness = 4;

const glowCutoff = 100;
const nyanCutoff = 400;

const TIME_DIVISOR = 10;
export function scoreFunction(time: number): number {
  return 2**(time / TIME_DIVISOR);
}

export function inverseScoreFunction(score: number): number {
  return Math.log2(score)*TIME_DIVISOR;
}

type LinearScale = ReturnType<typeof linearScale>;
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

  scale.extent = () => domain[1] - domain[0];

  scale.inMin = () => domain[0];
  scale.inMax = () => domain[1];
  scale.min = () => range[0];
  scale.max = () => range[1];

  return scale;
}

function drawAxisTicks(
    ctx: CanvasRenderingContext2D,
    width: number,
    scale: LinearScale,
    interval: number,
) {
  for (let pos = 0; pos < scale.inMax() - 0.01; pos += interval) {
    if (pos <= scale.inMin()) continue;
    ctx.font = "bold 12px Roboto";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff99";
    ctx.shadowBlur = 0;
    const n = pos !== (pos | 0) ? pos.toFixed(1) : pos.toFixed(0);
    ctx.fillText(n + "X", 0, Math.floor(scale(pos)) - 5);

    ctx.strokeStyle = "#ffffff33";
    ctx.beginPath();
    ctx.moveTo(0, Math.floor(scale(pos)));
    ctx.lineTo(width, Math.floor(scale(pos)));
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
  }
}

export const BustChart: FC<{

}> = (props) => {
  const [t] = useTranslation();
  const [wrapper, setWrapper] = useState<HTMLElement>();
  const { w: width, h: height } = useElementSize(wrapper);

  const canvas = useRef() as MutableRefObject<HTMLCanvasElement>;

  const bust = useSelector<RootState>(state => state.game.bust) as number;
  const store = useStore();

  const [
    x, y,
  ] = useMemo(() => [
    linearScale().domain([0, 10]).range([10, width - 10]),
    linearScale().domain([1, 2]).range([height - 10, 10]),
  ], [width, height, bust]);

  const bustEffectTime = useMemo(() => performance.now(), [bust]);

  const perfOff = useMemo(() => +new Date() - performance.now(), []);
  useAnimationFrame((e) => {
    if (!canvas.current) return;
    if (!width || !height) return;

    const state = store.getState();
    const timeDiff = (performance.now() + perfOff - state.game.start - state.game.tdiff)/1000;
    // console.log(timeDiff);

    const ctx = canvas.current.getContext("2d")!;

    ctx.clearRect(0, 0, 1000, 1000);


    const currentScore = (state.game.bust/100) || scoreFunction(timeDiff);
    const aTime = inverseScoreFunction(currentScore);
    if (aTime > x.inMax()) {
      x.domain([0, aTime]);
      y.domain([1, currentScore]);
    }

    const connected = getConnection().active;
    if (connected && currentScore >= 1) {
      drawAxisTicks(ctx, width, y, getMajorInterval(y.inMin(), y.inMax()));

      ctx.beginPath();

      ctx.strokeStyle = "#3d63d6aa";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";

      ctx.moveTo(x(0), y(1));
      for (let i = 0; i < aTime && i < x.inMax();
        i += Math.abs(x.inverse(x.min() + 1))/smoothness) {
        ctx.lineTo(x(i), y(scoreFunction(i)));
      }
      ctx.stroke();

      const shake = !bust && currentScore > nyanCutoff
        ? clamp(
            0, 3,
            (aTime - inverseScoreFunction(nyanCutoff))/5,
        ) * (Math.random() - 1) : 0;
      const text = currentScore.toFixed(2) + "X";

      ctx.font = "bold 48px Roboto";
      ctx.shadowBlur = 0;
      ctx.textAlign = "right";

      // Bust effect
      if (bust) {
        const bustElapsed = (performance.now() - bustEffectTime)/1000;
        const opacityStep = clamp(0, 255, 200*bustElapsed) | 0;

        for (let i = 1; i < 5; i++) {
          ctx.fillStyle="#ff0000" + Math.max(0, 255 - opacityStep*i).toString(16).padStart(2, "0");
          ctx.fillText(text, x.max() - i*32*bustElapsed**0.75, y.min());
        }
      }

      const opacity = clamp(153, 255, 153 + (aTime - inverseScoreFunction(glowCutoff))*5) | 0;
      if (!bust && currentScore > nyanCutoff) {
        const c = new HSVColor(0, 0, 1);
        c.h = aTime % 1;
        c.s = clamp(0.001, 1, (aTime - inverseScoreFunction(nyanCutoff))/10);
        const col = c.asRGB().toString();

        ctx.fillStyle = col + opacity.toString(16);
      } else {
        ctx.fillStyle = "#ffffff" + opacity.toString(16);
      }

      if (bust) {
        ctx.fillStyle = "#ff0000";
      }

      const shadowOpacity = clamp(8, 12, 8+(aTime - inverseScoreFunction(glowCutoff))*5);
      const shadowColor = lerpColorsRGB(
          [[0, "#000000"], [1, "#ffffff"]],
          bust ? 0 : timeDiff - inverseScoreFunction(glowCutoff),
      );

      ctx.shadowColor = shadowColor + "99";
      ctx.shadowBlur = shadowOpacity;

      const angle = 2*Math.PI*Math.random();
      ctx.fillText(text, x.max() + Math.cos(angle)*shake, y.min() + Math.sin(angle)*shake);

      if (bust) {
        ctx.font = "bold 18px Roboto";
        ctx.fillText(t("game.busted").toLocaleUpperCase(), x.max(), y.min() - 48);
      }

      ctx.closePath();
    } else {
      // `Next game will start in ${(-aTime).toFixed(2)}`;
      const text = connected
        ? t("game.nextGame", { time: (-aTime).toFixed(2) })
        : t("game.connecting");

      ctx.font = "bold 18px Roboto";
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff99";
      ctx.shadowColor = "#00000099";
      ctx.shadowBlur = 8;
      ctx.fillText(text, width/2, height/2);
    }
  });

  return (
    <div className="full-size" ref={el => setWrapper(el!)}>
      <canvas className="absolute" width={width} height={height} ref={canvas}></canvas>
    </div>
  );
};
