import { createReducer, ActionType, Reducer } from "typesafe-actions";
import { receievePrivateMessage, receiveMessage } from "../actions/ChatActions";

export interface ChatMessage {
  from: string;
  message: string;
  timestamp: Date;
}

export interface State {
  readonly chat: ChatMessage[];
  readonly dms: Record<string, ChatMessage[]>;
}

const initialState: State = {
  chat: [],
  dms: {},
};

export const ChatReducer: Reducer<State, any> = createReducer(initialState)
    // Receive Message
    .handleAction(receiveMessage, (state: State, { payload }
      : ActionType<typeof receiveMessage>) => ({
      ...state,
      chat: (state.chat ?? []).concat([payload]),
    }))

    // Receive Private Message
    .handleAction(receievePrivateMessage, (state: State, { payload }
      : ActionType<typeof receievePrivateMessage>) => ({
      ...state,
      dms: {
        ...state.dms,
        [payload.feed]: (state.dms[payload.feed] ?? []).concat(payload),
      },
    }));
