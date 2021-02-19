import { FC, useState } from "react";
import { clazz } from "../util/class";
import { Tooltip } from "./pop";
import "./form.scss";

function numberInputOnly(e: React.KeyboardEvent<HTMLInputElement>): boolean {
  if (e.key.length === 1 && !e.key.match(/[0-9.]/)) {
    e.preventDefault();
    return false;
  }

  return true;
}

export const NumericalInput: FC<{
  label: string
  suffix?: string
  suffixTooltip?: string
  reformatter?: (value: string) => string
  onChange?: (value: string) => void
  value?: string
}> = (props) => {
  const [suffixRef, setSuffix] = useState<HTMLElement | null>();

  return (
    <div className="input-container">
      <div className="label">
        {props.label}
      </div>
      <input
        className="right"
        type="text"
        onKeyDown={numberInputOnly}
        value={props.value}
        onChange={(e) => {
          const value = e.target.value;
          props.onChange?.(value);

          if (props.reformatter) {
            e.target.value = props.reformatter(value);
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
}> = (props) => {
  return (
    <button
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
