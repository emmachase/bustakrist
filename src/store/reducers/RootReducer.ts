import { combineReducers } from "redux";
import { StateType } from "typesafe-actions";
import { GameReducer } from "./GameReducer";
import { UserReducer } from "./UserReducer";
import { ChatReducer } from "./ChatReducer";
import { PlayersReducer } from "./PlayersReducer";

const root = combineReducers({
  game: GameReducer,
  user: UserReducer,
  chat: ChatReducer,
  players: PlayersReducer,
});

export default root;
export type RootState = StateType<typeof root>;
