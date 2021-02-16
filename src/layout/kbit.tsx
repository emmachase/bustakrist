import { CSSProperties, FC } from "react";
import { BustChart } from "../components/chart";
import "./kbit.scss";
import { clazz } from "../util/class";
import { useTranslation } from "react-i18next";
import { BetUI } from "./betui";
import { AuthUI } from "./auth";
import { useSelector } from "react-redux";
import { RootState } from "../store/reducers/RootReducer";

const Card: FC<{
  area?: string,
  row?: number,
  col?: number,
  rowSpread?: number,
  colSpread?: number,
  className?: string,
  id?: string,
  style?: CSSProperties
}> = (props) => {
  return (
    <div id={props.id}
      className={clazz("card", props.className)}
      style={{
        // gridRow: props.row,
        // gridRowEnd: props.row ?? 0 + (props.rowSpread ?? 1),
        // gridColumn: props.col,
        // gridColumnEnd: props.col ?? 0 + (props.colSpread ?? 1),
        gridArea: props.area,
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
};

export function KBitLayout() {
  const [t] = useTranslation();

  const username = useSelector<RootState>(s => s.user.name);
  console.log("uname", username);

  return (
    <div className="kbit-layout">
      <Card area="graph" style={{
        // paddingLeft: 0,
        // paddingBottom: 25,
      }}>
        <BustChart />
      </Card>
      <Card area="act">
        {
          username === null
            ? <AuthUI/>
            : <BetUI />
        }
      </Card>
      <Card id="players" area="play">
        {t("bet.test")}
      </Card>
      <Card area="multi"></Card>
    </div>
  );
}
