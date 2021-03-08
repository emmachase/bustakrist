import { createReducer, ActionType, Reducer } from "typesafe-actions";
import { clearPlayerlist, playerCashedout, PlayerStake,
  updatePlaying, wagerAdd, wagerAddBulk } from "../actions/PlayersActions";

export interface State {
  readonly userIsPlaying: boolean | "active" | "pending";
  readonly players: PlayerStake[];
}

const initialState: State = {
  userIsPlaying: false,
  players: [],
};

export const PlayersReducer: Reducer<State, any> = createReducer(initialState)
    // Clear playlist
    .handleAction(clearPlayerlist, (state: State, { payload }
      : ActionType<typeof clearPlayerlist>) => ({
      ...state,
      players: [],
    }))
    // A new wager is listed
    .handleAction(wagerAdd, (state: State, { payload }
      : ActionType<typeof wagerAdd>) => ({
      ...state,
      players: state.players.concat([payload]),
    }))
    // Bulk wager when game loads
    .handleAction(wagerAddBulk, (state: State, { payload }
      : ActionType<typeof wagerAddBulk>) => ({
      ...state,
      players: payload.players.map(p => ({
        name: p.name,
        wager: p.wager,
        multiplier: p.cashout,
      })),
    }))
    // Cashout a player
    .handleAction(playerCashedout, (state: State, { payload }
    : ActionType<typeof playerCashedout>) => {
      const players = [];
      for (const p of state.players) {
        if (p.name === payload.name) {
          players.push({
            ...p, multiplier: payload.cashout,
          });
        } else {
          players.push(p);
        }
      }

      return {
        ...state, players,
      };
    })
    // Whether the player is currently in the _active_ game
    .handleAction(updatePlaying, (state: State, { payload }
      : ActionType<typeof updatePlaying>) => ({
      ...state,
      userIsPlaying: payload.playing,
    }));
