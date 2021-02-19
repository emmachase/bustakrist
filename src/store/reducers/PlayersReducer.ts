import { createReducer, ActionType, Reducer } from "typesafe-actions";
import { wagerAdd } from "../actions/PlayersActions";

export interface PlayerStake {
  name: string,
  wager: number,
  multiplier?: number
  // profit can be implied
}

export interface State {
  readonly players: PlayerStake[];
}

const initialState: State = {
  players: [
    {"name":"3d6",wager:2000,},
    {"name":"byemoney",wager:1000,},
    {"name":"bollark",wager:222.22,},
    {"name":"emma",wager:50,},
    {"name":"ustyn probblably",wager:20,},
    {"name":"my alt",wager:2,},
    {"name":"my 2nd alt",wager:2,},
    {"name":"my 3rd alt",wager:2,},
    {"name":"my 4th alt",wager:2,},
    {"name":"my 5th alt",wager:2,},
    {"name":"1lann",wager:0.02,multiplier:2},
  ]
};

export const PlayersReducer: Reducer<State, any> = createReducer(initialState)
    // A new wager is listed
    .handleAction(wagerAdd, (state: State, { payload }
      : ActionType<typeof wagerAdd>) => ({
      ...state,
      chat: state.players.concat([payload]),
    }));