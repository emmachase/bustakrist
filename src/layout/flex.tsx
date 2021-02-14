import { FC } from "react";
import { clazz } from "../util/class";

export function Spacer() {
  return <div style={{
    flex: 1,
  }}></div>;
}

export const Flexor: FC<{
  direction?: "row" | "column",
  fill?: boolean
}> = (props) => {
  return (
    <div className={clazz(props.fill && "full-size")} style={{
      display: "flex",
      flexDirection: props.direction ?? "row",
    }}>
      {props.children}
    </div>
  );
};
