import { useTranslation } from "react-i18next";
import { clazz } from "../util/class";
import { useKState } from "../util/types";

export function PlayersTable() {
  const [t] = useTranslation();
  const players = useKState(s => s.players.players);
  const bust = useKState(s => s.game.bust);

  return (
    <tbody id="players-list">
      { players.map((b, idx) => { //TODO: sort by amount and whether or not they cahshed out
        const multiplier = b.multiplier &&
          (b.multiplier / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) + "×";
        const wager = b.wager.toLocaleString(undefined);
        const profit = b.multiplier &&
          ((b.multiplier*b.wager)/100 - b.wager)
              .toLocaleString(undefined,
                  { minimumFractionDigits: 2 }) + t("game.currencyShortname");

        return (
          <tr key={idx}
            className={clazz(
                b.multiplier !== undefined && "c-win",
                bust > 0 && b.multiplier === undefined && "c-lose",
            )}>
            <td className="players-user"><div className="trans-container">{b.name}</div></td>
            <td><div className="trans-container">{multiplier}</div></td>
            <td><div className="trans-container">{wager}<small>{t("game.currencyShortname")}</small></div></td>
            <td className="players-profit"><div className="trans-container">{profit}</div></td>
          </tr>
        );
      })}
    </tbody>
  );
}
