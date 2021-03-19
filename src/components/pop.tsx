import { FC, MutableRefObject, useMemo, useRef } from "react";
import { usePopperTooltip, Config as PopperConfig } from "react-popper-tooltip";
import { clazz } from "../util/class";
import "./pop.scss";

export const Tooltip: FC<{
  refEl: HTMLElement
  config?: PopperConfig
  className?: string
}> = (props) => {
  // const rtest = useRef() as any;
  const {
    getArrowProps,
    getTooltipProps,
    setTooltipRef,
    setTriggerRef,
    visible,
    forceUpdate,
  } = usePopperTooltip(props.config);

  useMemo(() => {
    setTriggerRef(props.refEl);
  }, [props.refEl]);

  return (
    <>
      {visible && (
        <div
          ref={setTooltipRef}
          {...getTooltipProps({ className: clazz("tooltip-container", props.className) })}
        >
          {props.children}
          <div {...getArrowProps({ className: "tooltip-arrow" })} />
        </div>
      )}
    </>
  );
};
