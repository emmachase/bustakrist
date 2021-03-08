import { FC } from "react";
import { clazz } from "../util/class";

export function Spacer(props: any) {
  return <div style={{
    flex: 1,
  }}>{props.children}</div>;
}

export const Flexor: FC<{
  className?: string
  direction?: "row" | "column"
  fill?: boolean
  justify?: "space-around" | "space-between" | "center"
  align?: "center"
}> = (props) => {
  return (
    <div className={clazz(props.fill && "full-size", props.className)} style={{
      display: "flex",
      flexDirection: props.direction ?? "row",
      justifyContent: props.justify,
      alignItems: props.align,
    }}>
      {props.children}
    </div>
  );
};
