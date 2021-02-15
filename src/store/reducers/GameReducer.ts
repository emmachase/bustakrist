import moment, { Moment } from "moment";
import { createReducer, ActionType } from "typesafe-actions";
import { bustGame, startGame } from "../actions/GameActions";

export interface State {
  readonly start: Moment;
  readonly bust: number;
}

const initialState: State = {
  start: moment.unix(0),
  bust: 0,
};

export const GameReducer = createReducer(initialState)
    // Start Game
    .handleAction(startGame, (state: State, { payload }: ActionType<typeof startGame>) => ({
      ...state,
      start: payload.start,
      bust: 0,
    }))
    // Bust Game
    .handleAction(bustGame, (state: State, { payload }: ActionType<typeof bustGame>) => ({
      ...state,
      bust: payload.bust,
    }));
