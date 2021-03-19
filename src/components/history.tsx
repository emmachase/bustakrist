import { useSelector } from "react-redux";
import { Flexor } from "../layout/flex";
import { RoundHistory } from "../store/actions/GameActions";
import { RootState } from "../store/reducers/RootReducer";
import { clazz } from "../util/class";
import { useKState } from "../util/types";
import useBreakpoint from "use-breakpoint";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { RiseOutlined } from "@ant-design/icons";
import "./history.scss";
import { formatScore } from "../util/score";

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
            {(b.bust/100).toFixed(2)}×
          </div>
        );
      })}
    </Flexor>
  );
}

export const LongHistory: FC<{

}> = () => {
  const [t] = useTranslation();
  const history = useKState(s => s.game.bustHistory);

  return (
    <div className="scroller roll-history">
      <table>
        <thead>
          <tr>
            <th>{t("history.gameNo")}</th>
            <th>{t("history.bust")}</th>
            <th className="t-right">{t("history.hash")}</th>
          </tr>
        </thead>
        <tbody>
          { history.map((round, idx) =>
            <tr key={idx}>
              <td className="gnum-d">{round.id}</td>
              <td className="bust-d">{formatScore(round.bust/100)}×</td>
              <td className="hash-d code">{round.hash}</td>
            </tr>,
          )}
        </tbody>
      </table>
    </div>
  );
};
