import { createReducer, ActionType, Reducer } from "typesafe-actions";
import { clearPlayerlist, playerCashedout, PlayerStake,
  updatePlaying, wagerAdd, wagerAddBulk } from "../actions/PlayersActions";

export interface State {
  readonly userIsPlaying: boolean | "active" | "pending";
  readonly players: PlayerStake[];
}

const initialState: State = {
  userIsPlaying: false,
  players: [
    { "name": "3d6", "wager": 2000 },
    { "name": "byemoney", "wager": 1000 },
    { "name": "bollark", "wager": 222.22 },
    { "name": "ema", "wager": 50 },
    { "name": "ustyn probblably", "wager": 20 },
    { "name": "my alt", "wager": 2 },
    { "name": "my 2nd alt", "wager": 2 },
    { "name": "my 3rd alt", "wager": 2 },
    { "name": "my 4th alt", "wager": 2 },
    { "name": "my 5th alt", "wager": 2 },
    { "name": "1lann", "wager": 0.02, "multiplier": 2 },
  ],
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
