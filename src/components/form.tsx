import { FC, useState } from "react";
import { clazz } from "../util/class";
import { Tooltip } from "./pop";
import "./form.scss";

// function numberInputOnly(e: React.KeyboardEvent<HTMLInputElement>): boolean {
//   if (e.key.length === 1 && !e.key.match(/[0-9.]/)) {
//     e.preventDefault();
//     return false;
//   }

//   return true;
// }

export const NumericalInput: FC<{
  label: string
  suffix?: string
  suffixTooltip?: string
  reformatter?: (value: string) => string
  onChange?: (value: number) => void
  value?: string
  initialValue?: number | string
}> = (props) => {
  const [suffixRef, setSuffix] = useState<HTMLElement | null>();

  const reformatter = props.reformatter ?? (x => x);
  const [iv, setIV] = useState(() =>
    reformatter((props.initialValue ?? props.value ?? 0).toString()));

  return (
    <div className="input-container">
      <div className="label">
        {props.label}
      </div>
      <input
        className="right"
        type="text"
        value={props.value ?? iv}
        onChange={(e) => {
          setIV(e.target.value);
          props.onChange?.(+e.target.value);
        }}

        onBlur={(e) => {
          if (props.reformatter) {
            const newV = props.reformatter(e.target.value);
            props.onChange?.(+newV);
            setIV(newV);
          }
        }}
      />
      <div className="suffix" ref={r => setSuffix(r)}>{props.suffix}</div>
      { props.suffixTooltip
      ? <Tooltip
        refEl={suffixRef as HTMLElement}
        config={{ delayShow: 300, placement: "top" }}
      >
        {props.suffixTooltip}
      </Tooltip> : null
      }
    </div>
  );
};

export const TextInput: FC<{
  label: string
  password?: boolean
  onChange?: (value: string) => void
  onFinish?: () => void
  value?: string
}> = (props) => {
  const checkKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      props.onFinish?.();
    }
  };

  return (
    <div className="input-container">
      <div className="label">
        {props.label}
      </div>
      <input
        type={props.password ? "password" : "text"}
        value={props.value}
        onKeyDown={checkKeys}
        onChange={(e) => props.onChange?.(e.target.value)}
      />
    </div>
  );
};

export const KButton: FC<{
  card?: boolean
  shorty?: boolean
  onClick?: () => void
  disabled?: boolean
}> = (props) => {
  return (
    <button
      disabled={props.disabled}
      onClick={props.onClick}
      className={clazz(
          "th-button",
          props.shorty && "shorty",
          props.card && "full-card",
      )}>
      {props.children}
    </button>
  );
};
