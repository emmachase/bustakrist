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

export const KInput: FC<{
  label?: string
  suffix?: string
  suffixTooltip?: string
  reformatter?: (value: string) => string
  onChange?: (value: string) => void
  onBlur?: (value: string) => void
  onFinish?: () => void
  value?: string
  initialValue?: number | string
  password?: boolean
  className?: string
  noFill?: boolean
  error?: string | null
  disabled?: boolean
}> = (props) => {
  const [suffixRef, setSuffix] = useState<HTMLElement | null>();

  const reformatter = props.reformatter ?? (x => x);
  const [iv, setIV] = useState(() =>
    reformatter((props.initialValue ?? props.value ?? "").toString()));

  const checkKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (props.reformatter) {
        const newV = props.reformatter((e.target as HTMLInputElement).value);
        props.onChange?.(newV);
        setIV(newV);
      }

      props.onFinish?.();
    }
  };

  const [inputRef, setInputRef] = useState<HTMLElement>();

  return (
    <div
      className={clazz(
        "input-container",
        props.error && "error",
        props.disabled && "disabled",
        props.className,
      )}
      ref={r => setInputRef(r as HTMLElement)}
    >
      {props.label && <div className="label">
        {props.label}
      </div>}
      <input
        className="right"
        type={props.password ? "password" : "text"}
        value={props.value ?? iv}
        onChange={(e) => {
          setIV(e.target.value);
          props.onChange?.(e.target.value);
        }}

        disabled={props.disabled}

        autoComplete={props.noFill ? "off" : undefined}

        onKeyDown={checkKeys}

        onBlur={(e) => {
          let val = e.target.value;
          if (props.reformatter) {
            val = props.reformatter(e.target.value);
            props.onChange?.(val);
            setIV(val);
          }

          props.onBlur?.(val);
        }}
      />
      { props.suffix && <>
          <div className="suffix" ref={r => setSuffix(r)}>{props.suffix}</div>
          { props.suffixTooltip
          ? <Tooltip
            refEl={suffixRef as HTMLElement}
            config={{ delayShow: 300, placement: "top" }}
          >
            {props.suffixTooltip}
          </Tooltip> : null
          }
        </>
      }

      {props.error && props.error.trim().length > 0 &&
        <Tooltip refEl={inputRef as HTMLElement}
          config={{ defaultVisible: true }}
        >
          {props.error}
        </Tooltip>
      }
    </div>
  );
};

export const KButton: FC<{
  card?: boolean
  shorty?: boolean
  onClick?: () => void
  disabled?: boolean
  className?: string
}> = (props) => {
  return (
    <button
      disabled={props.disabled}
      onClick={props.onClick}
      className={clazz(
          "th-button",
          props.shorty && "shorty",
          props.card && "full-card",
          props.className,
      )}>
      {props.children}
    </button>
  );
};
