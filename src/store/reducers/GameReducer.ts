import { createReducer, ActionType, Reducer } from "typesafe-actions";
import { playSound } from "../../audio/AudioManager";
import { bustGame, loadHistory, RoundHistory, startGame } from "../actions/GameActions";

export interface State {
  readonly gameid: number;
  readonly tdiff: number;
  readonly start: number;
  readonly bust: number;
  readonly bustHistory: RoundHistory[];

  readonly wager: number | null;
  readonly payout: number | null; // Forcing cashout at
  readonly multiplier: number | null; // Cashed out at
}

const initialState: State = {
  gameid: 0,
  tdiff: 0,
  start: 0,
  bust: 0,
  bustHistory: [],

  wager: null,
  payout: null,
  multiplier: null,
};

export const GameReducer: Reducer<State, any> = createReducer(initialState)
    // Start Game
    .handleAction(startGame, (state: State, { payload }: ActionType<typeof startGame>) => ({
      ...state,
      gameid: payload.id,
      tdiff: payload.tdiff,
      start: payload.start,
      bust: 0,
    }))
    // Bust Game
    .handleAction(bustGame, (state: State, { payload }: ActionType<typeof bustGame>) => ({
      ...state,
      bust: payload.bust,
      bustHistory: [{
        id: state.gameid,
        bust: payload.bust,
        hash: payload.hash,
        bet: state.wager,
        multiplier: state.multiplier,
      } as RoundHistory].concat(state.bustHistory).slice(0, 40),
    }))
    // Preload History
    .handleAction(loadHistory, (state: State, { payload }: ActionType<typeof loadHistory>) => ({
      ...state,
      bustHistory: payload.history.concat(state.bustHistory).slice(0, 200),
    }));
