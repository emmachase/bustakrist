import { useSelector } from "react-redux";
import { Flexor } from "../layout/flex";
import { RoundHistory } from "../store/actions/GameActions";
import { RootState } from "../store/reducers/RootReducer";
import { clazz } from "../util/class";
import { useKState } from "../util/types";
import useBreakpoint from "use-breakpoint";

const BREAKPOINTS = { mobile: 0, desktop: 400 };

export function ShortHistory() {
  const history = useKState(s => s.game.bustHistory);
  const brk = useBreakpoint(BREAKPOINTS, "desktop");

  const lastCount = (brk.breakpoint === "desktop") ? 5 : 4;

  return (
    <Flexor>
      { history.slice(0, lastCount).map((b, idx) => {
        const idxAlpha = ((idx) / (lastCount));

        return (
          <div
            className={clazz(
                "grow",
                "t-center",
                (b.bust >= 198) ? "c-win" : "c-lose",
            )}
            style={{
              fontWeight: "bold",
              opacity: 1 - idxAlpha**1.5,
            }}
            key={idx}>
            {(b.bust/100).toFixed(2)}x
          </div>
        );
      })}
    </Flexor>
  );
}
