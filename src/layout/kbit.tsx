import { FC } from "react";
import { NumericalInput } from "./form";
import "./kbit.scss";

const Card: FC<{
  row: number,
  col: number,
  rowSpread?: number,
  colSpread?: number,
}> = (props) => {
  return (
    <div
      className="card"
      style={{
        gridRow: props.row,
        gridRowEnd: props.row + (props.rowSpread ?? 1),
        gridColumn: props.col,
        gridColumnEnd: props.col + (props.colSpread ?? 1),
      }}
    >
      {props.children}
    </div>
  );
};

export function KBitLayout() {
  return (
    <div className="kbit-layout">
      <Card row={1} col={1}></Card>
      <Card row={1} col={2}>
        <NumericalInput label="Bet" suffix="KST"/>
        <NumericalInput label="Payout" suffix="x"/>
      </Card>
      <Card row={1} col={3} rowSpread={2}></Card>
      <Card row={2} col={1} colSpread={2}></Card>
    </div>
  );
}
