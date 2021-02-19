import { useSelector } from "react-redux";
import { Flexor } from "../layout/flex";
import { PlayerStake } from "../store/actions/PlayersActions";
import { RootState } from "../store/reducers/RootReducer";
import { clazz } from "../util/class";
import { useKState } from "../util/types";
import useBreakpoint from "use-breakpoint";

export function AddPlayer(name: string, stake: number) {
  const playerlist = document.getElementById("players-list");

}

export function PlayersTable() {
  const players = useKState(s => s.players.players);

  return (
    <tbody id="players-list">
      { players.map((b, idx) => { //TODO: sort by amount and whether or not they cahshed out
        const wager = b.wager.toLocaleString(undefined, {minimumFractionDigits: 2});
        return (
          <tr
            className={clazz(
                //(b.bust >= 198) ? "c-win" : "c-lose",
            )}>
            <td className="players-user"><div className="trans-container">{b.name}</div></td>
            <td><div className="trans-container"></div></td>
            <td><div className="trans-container">{wager}</div></td>
            <td className="players-profit"><div className="trans-container"></div></td>
          </tr>
        );
      })}
    </tbody>
  );

  return (
    <tbody id="players-list">
      <tr>
        <td className="players-user"><div className="trans-container open">3d6</div></td>
        <td><div className="trans-container open"></div></td>
        <td><div className="trans-container open">1.00<span className="players-currency">KST</span></div></td>
        <td className="players-profit"><div className="trans-container open"></div></td>
      </tr>
      <tr>
        <td className="players-user">3d6</td>
        <td>2.00&times;</td>
        <td>1.00<span className="players-currency">LRA</span></td>
        <td className="players-profit">2.00</td>
      </tr>
    </tbody>
  );
}