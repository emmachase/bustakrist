import { FC } from "react";
import "./misc.scss";

export const Divider: FC<{
  margin?: number
}> = (props) => {
  return (<div
    className="divider"
    style={{
      marginTop: props.margin ?? 0,
      marginBottom: props.margin ?? 0,
    }}
  />);
};
