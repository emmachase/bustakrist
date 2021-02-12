import { FC } from "react";
import "./form.scss";

function numberInputOnly(e: React.KeyboardEvent<HTMLInputElement>): boolean {
  if (e.key.length === 1 && !e.key.match(/[0-9]/)) {
    e.preventDefault();
    return false;
  }

  return true;
}

export const NumericalInput: FC<{
  label: string,
  suffix?: string
}> = (props) => {
  return (
    <div className="input-container">
      <div className="label">
        {props.label}
      </div>
      <input type="text" onKeyDown={numberInputOnly}/>
      <div className="suffix">{props.suffix}</div>
    </div>
  );
};
