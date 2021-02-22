import { FC } from "react";
import { clazz } from "../util/class";
import "./skeletons.scss";

export const BlockSkeleton: FC<{
  height: number | string
  className?: string
}> = (props) => {
  return (
    <div
      className={clazz("skeleton block", props.className)}
      style={{
        height: props.height,
      }}
    />
  );
};
