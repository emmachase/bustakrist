import { FC } from "react";
import { clazz } from "../../util/class";
import "./spinner.scss";

export const Spinner: FC<{
  relative?: boolean
}> = (props) => {
  return (
    <div className={clazz("center", props.relative && "relative")}>
      <div className="loader">
        <div className="spinner a"></div>
        <div className="spinner b"></div>
        <div className="spinner c"></div>
      </div>
    </div>
  );
};
