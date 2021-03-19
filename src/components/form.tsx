import { FC, ReactElement, useEffect, useState, useContext, createContext, useMemo } from "react";
import { clazz } from "../util/class";
import { Tooltip } from "./pop";
import { UpOutlined, DownOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import "./form.scss";
import { Modal, ModalContext } from "./modal";
import { Subject } from "../util/Subject";

// function numberInputOnly(e: React.KeyboardEvent<HTMLInputElement>): boolean {
//   if (e.key.length === 1 && !e.key.match(/[0-9.]/)) {
//     e.preventDefault();
//     return false;
//   }

//   return true;
// }

export const reformatters = {
  int: (v: string) => (isNaN(+v) ? 1 : +v).toFixed(0),
  dec2: (v: string) => (isNaN(+v) ? 2 : +v).toFixed(2),
};

type Validator = (value: string) => [boolean, string | null]

export function requiredValidator(error: string): Validator {
  return (x) => {
    return [x.toString().length > 0, error];
  };
};

export function balanceValidator(
  balance: number | null,
  lowBalError: string,
  atLeastOneError: string,
): Validator {
  return (x) => {
    if (!balance) return [false, lowBalError];
    if (+x < 1) return [false, atLeastOneError];
    return [balance >= 100*+x, lowBalError];
  };
};

export function minValidator(min: number, error: string): Validator {
  return (x) => {
    return [+x >= min, error];
  };
};

interface FormController<T extends Record<string, unknown> = any> {
  errors: Record<string, string | null>
  validationState: boolean;
  setValidationState: (v: boolean) => void;
  validateEvent: Subject<T>;
  setField<F extends keyof T>(field: F, value: T[F]): void;
  getState(): T
}

export const FormContext = createContext<FormController | null>(null);

export function useFormController<T extends Record<string, unknown> = any>(
  defaults: () => Partial<T> = () => ({}),
  depends: unknown[] = [],
): FormController<T> {
  const [state, setState] = useState(defaults);
  const [validationState, setValidationState] = useState(true);
  const [errors, setErrors] = useState({});
  const validateEvent = useMemo(() => new Subject<T>(), []);

  useEffect(() => {
    validateEvent.next(state as T);
  }, depends);

  return {
    errors,
    validateEvent,
    validationState,
    setValidationState,
    setField<F extends keyof T>(field: F, value: T[F]) {
      const newState = { ...state, [field]: value };
      setState(newState);

      this.validationState = true;
      validateEvent.next(newState as T);
      setValidationState(this.validationState);
      setErrors(this.errors);
    },
    getState() {
      return state as T;
    },
  };
}

export const KDropdown: FC<{
  label?: string
  options: { label: ReactElement, value: string, help?: ReactElement }[]
  value?: string | null
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  disabled?: boolean
  error?: string | null
}> = (props) => {
  const modalCtx = useContext(ModalContext);
  const [inputRef, setInputRef] = useState<HTMLElement>();

  const [open, setOpen] = useState(false);
  useEffect(() => void setOpen(false), [props.value]);

  const openHelp = (label: ReactElement, helpStr: ReactElement) => {
    modalCtx?.show(<Modal>
      <Modal.Header close>
        {label}
      </Modal.Header>
      <Modal.Content>
        {helpStr}
      </Modal.Content>
    </Modal>);
  };

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

      <div className="input right clickable" onClick={() => setOpen(!open)}>
        <span className={clazz("ellipsis", !props.value && "placeholder")}>
          {props.options.find(x => x.value === props.value)?.label ?? props.placeholder}
        </span>
        {open
          ? <DownOutlined />
          : <UpOutlined />}
      </div>

      <div className={clazz("form-options", open && "visible")}>
        { props.options.map((option, idx) =>
          <div
            key={idx} className={clazz("option", props.value === option.value && "selected")}
            onClick={() => props.onChange(option.value)}
          >
            <span className="option-label">
              {option.label}
            </span>
            {option.help && <span className="option-help" onClick={e => {
                e.stopPropagation(); // Prevent closing of the dropdown
                openHelp(option.label, option.help!);
            }}>
              <QuestionCircleOutlined />
            </span>}
          </div>,
        ) }
      </div>

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

export const KInput: FC<{
  name?: string
  label?: string
  suffix?: string
  suffixTooltip?: string
  validators?: Validator[]
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
  const formCtx = useContext(FormContext);
  useEffect(() => formCtx?.validateEvent.subscribe(e => {
    for (const validator of props.validators ?? []) {
      const [valid, err] = validator(e[props.name!] ?? "");
      if (valid) {
        formCtx.errors[props.name!] = null;
      } else {
        formCtx.validationState = false;
        formCtx.errors[props.name!] = err!;
        break;
      }
    };
  }));

  const [suffixRef, setSuffix] = useState<HTMLElement | null>();

  const [dirty, setDirty] = useState(() => false);

  const reformatter = props.reformatter ?? (x => x);
  const [iv, setIV] = useState(() =>
    reformatter((
      formCtx?.getState()[props.name ?? ""] ??
      props.initialValue ??
      props.value ??
      "").toString()));

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

  const error = props.error || (dirty && formCtx?.errors[props.name ?? ""]);

  return (
    <div
      className={clazz(
        "input-container",
        error && "error",
        props.disabled && "disabled",
        props.className,
      )}
      ref={r => setInputRef(r as HTMLElement)}
    >
      {props.label && <div className="label">
        {props.label}
      </div>}
      <input
        className="input right"
        type={props.password ? "password" : "text"}
        value={props.value ?? iv}
        onChange={(e) => {
          setIV(e.target.value);
          props.onChange?.(e.target.value);
          formCtx?.setField(props.name!, e.target.value);
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

            formCtx?.setField(props.name!, val);
          }

          setDirty(true);
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

      {error && error.trim().length > 0 &&
        <Tooltip refEl={inputRef as HTMLElement}
          config={{ defaultVisible: true }}
        >
          {error}
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
  requireValid?: boolean
}> = (props) => {
  const formCtx = useContext(FormContext);
  const disabledByForm = props.requireValid && formCtx?.validationState === false;

  return (
    <button
      disabled={props.disabled || disabledByForm}
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
