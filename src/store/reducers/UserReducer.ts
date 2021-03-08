import { createReducer, ActionType, Reducer } from "typesafe-actions";
import { addFriends, authUser, logoutUser
  , removeFriend, updateBalance } from "../actions/UserActions";

export interface State {
  readonly name: string | null
  readonly bal: number | null // Fixed point 2 precision
  readonly friends: string[]
}

const initialState: State = {
  name: null,
  bal: null,
  friends: [],
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
      friends: [],
    }))
    // Update Balance
    .handleAction(updateBalance, (state: State, { payload }: ActionType<typeof updateBalance>) => ({
      ...state,
      bal: payload.bal,
    }))
    // Add Friends
    .handleAction(addFriends, (state: State, { payload }: ActionType<typeof addFriends>) => ({
      ...state,
      friends: Array.from(new Set(state.friends.concat(payload.friends))),
    }))
    // Remove Friend
    .handleAction(removeFriend, (state: State, { payload }: ActionType<typeof removeFriend>) => ({
      ...state,
      friends: state.friends.filter(f => f !== payload.friend),
    }));
