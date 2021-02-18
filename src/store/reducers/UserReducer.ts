import { createReducer, ActionType, Reducer } from "typesafe-actions";
import { authUser, logoutUser, updateBalance } from "../actions/UserActions";

export interface State {
  readonly name: string | null
  readonly bal: number | null // Fixed point 2 precision
}

const initialState: State = {
  name: null,
  bal: null,
};

export const UserReducer: Reducer<State, any> = createReducer(initialState)
    // Auth User
    .handleAction(authUser, (state: State, { payload }: ActionType<typeof authUser>) => ({
      ...state,
      name: payload.name,
      bal: payload.bal,
    }))
    // Logout User
    .handleAction(logoutUser, (state: State, { payload }: ActionType<typeof logoutUser>) => ({
      ...state,
      name: null,
      bal: null,
    }))
    // Update Balance
    .handleAction(updateBalance, (state: State, { payload }: ActionType<typeof updateBalance>) => ({
      ...state,
      bal: payload.bal,
    }));
