import { combineReducers } from "redux";
import { StateType } from "typesafe-actions";
import { GameReducer } from "./GameReducer";
import { UserReducer } from "./UserReducer";
import { ChatReducer } from "./ChatReducer";

const root = combineReducers({
  game: GameReducer,
  user: UserReducer,
  chat: ChatReducer,
});

export default root;
export type RootState = StateType<typeof root>;
