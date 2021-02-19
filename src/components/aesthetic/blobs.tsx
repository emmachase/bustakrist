import { useEffect, useMemo, useRef, useState } from "react";
import { Color, lerpColors, sanitizeStops } from "../../util/color";
import "./blobs.scss";

const colorRange = sanitizeStops([
  new Color("#120078").asHSV().multSaturation(0.8).asRGB().toString(),
  new Color("#9d0191").asHSV().multSaturation(0.8).asRGB().toString(),
  new Color("#fd3a69").asHSV().multSaturation(0.8).asRGB().toString(),
  new Color("#fecd1a").asHSV().multSaturation(0.8).asRGB().toString(),
]);

const blobSpeed = 0.001;
function Blob() {
  const myColor = useMemo(() => lerpColors(colorRange, Math.random()), []);
  const myScale = useMemo(() => 0.5 + Math.random(), []);
  const [, rerender] = useState(0);
  const pos = useRef([Math.random(), Math.random()]);
  const vel = useRef([
    blobSpeed*2*(Math.random() - 0.5),
    blobSpeed*2*(Math.random() - 0.5),
  ]);

  const animate = () => {
    if (pos.current[0] < 0) vel.current[0] = -vel.current[0];
    if (pos.current[1] < 0) vel.current[1] = -vel.current[1];
    if (pos.current[0] > 1) vel.current[0] = -vel.current[0];
    if (pos.current[1] > 1) vel.current[1] = -vel.current[1];
    pos.current[0] += vel.current[0];
    pos.current[1] += vel.current[1];
    rerender(pos.current[0]);

    animateRef.current = requestAnimationFrame(animate);
  };

  const animateRef = useRef<number>();
  useEffect(() => {
    animateRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animateRef.current as number);
  }, []);

  return (<div
    className="blob"
    style={{
      backgroundColor: myColor,
      transform: `translate3d(${
        window.innerWidth*pos.current[0]}px, ${
        window.innerHeight*pos.current[1]}px, 0) scale(${myScale})`,
    }}
  ></div>);
}

/**
 * Provides a blurred blobby background.
 */
export default function Blobs(props: { count: number }) {
  const blobs = useMemo(() => new Array(props.count).fill(0), [props.count]);

  return (
    <div>
      <div className="blobs">
        {blobs.map((_, i) => (<Blob key={i}/>))}
      </div>
    </div>
  );
}
