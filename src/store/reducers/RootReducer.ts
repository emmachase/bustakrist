import { combineReducers } from "redux";
import { StateType } from "typesafe-actions";
import { GameReducer } from "./GameReducer";
import { UserReducer } from "./UserReducer";

const root = combineReducers({
  game: GameReducer,
  user: UserReducer,
});

export default root;
export type RootState = StateType<typeof root>;
