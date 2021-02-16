import { createReducer, ActionType, Reducer } from "typesafe-actions";
import { authUser, updateBalance } from "../actions/UserActions";

export interface State {
  readonly name: string | null
  readonly bal: number | null // Fixed point 2 precision
}

const initialState: State = {
  name: null,
  bal: null,
};

export const UserReducer: Reducer<State, any> = createReducer(initialState)
    // Start Game
    .handleAction(authUser, (state: State, { payload }: ActionType<typeof authUser>) => ({
      ...state,
      name: payload.name,
      bal: payload.bal,
    }))
    // Bust Game
    .handleAction(updateBalance, (state: State, { payload }: ActionType<typeof updateBalance>) => ({
      ...state,
      bal: payload.bal,
    }));
