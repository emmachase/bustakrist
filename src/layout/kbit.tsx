import { CSSProperties, FC } from "react";
import { KButton, NumericalInput } from "../components/form";
import { BustChart } from "../components/chart";
import "./kbit.scss";
import { Flexor, Spacer } from "./flex";
import { clazz } from "../util/class";

const Card: FC<{
  row: number,
  col: number,
  rowSpread?: number,
  colSpread?: number,
  className?: string,
  style?: CSSProperties
}> = (props) => {
  return (
    <div
      className={clazz("card", props.className)}
      style={{
        gridRow: props.row,
        gridRowEnd: props.row + (props.rowSpread ?? 1),
        gridColumn: props.col,
        gridColumnEnd: props.col + (props.colSpread ?? 1),
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
};

export function KBitLayout() {
  return (
    <div className="kbit-layout">
      <Card row={1} col={1} style={{
        paddingLeft: 0,
        paddingBottom: 25,
      }}>
        <BustChart />
      </Card>
      <Card row={1} col={2}>
        <Flexor fill direction="column">
          <NumericalInput label="Bet" suffix="KST"/>
          <NumericalInput label="Payout" suffix="x"/>

          <Spacer/>

          <KButton card>BET</KButton>
        </Flexor>
      </Card>
      <Card row={1} col={3} rowSpread={2}>
        Hello
      </Card>
      <Card row={2} col={1} colSpread={2}></Card>
    </div>
  );
}
