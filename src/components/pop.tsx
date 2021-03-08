import { FC, MutableRefObject, useMemo, useRef } from "react";
import { usePopperTooltip, Config as PopperConfig } from "react-popper-tooltip";
import "./pop.scss";

export const Tooltip: FC<{
  refEl: HTMLElement
  config?: PopperConfig
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
      {/* <div ref={rtest}>Test</div> */}
      {visible && (
        <div
          ref={setTooltipRef}
          {...getTooltipProps({ className: "tooltip-container" })}
        >
          {props.children}
          <div {...getArrowProps({ className: "tooltip-arrow" })} />
        </div>
      )}
    </>
  );
};
