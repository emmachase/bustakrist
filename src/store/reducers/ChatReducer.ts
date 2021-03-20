import { createReducer, ActionType, Reducer } from "typesafe-actions";
import { readMessages, receievePrivateMessage, receiveMessage } from "../actions/ChatActions";

export interface ChatMessage {
  id: string;
  from: string;
  message: string;
  timestamp: Date;
}

export interface State {
  readonly unread: Set<string>;
  readonly chat: ChatMessage[];
  readonly dms: Record<string, ChatMessage[]>;
}

const initialState: State = {
  unread: new Set<string>(),
  chat: [],
  dms: {},
};

export const ChatReducer: Reducer<State, any> = createReducer(initialState)
    // Receive Message
    .handleAction(receiveMessage, (state: State, { payload }
      : ActionType<typeof receiveMessage>) => ({
      ...state,
      chat: (state.chat ?? []).concat([payload]).slice(-100),
      unread: new Set(state.unread).add(payload.id),
    }))

    // Receive Private Message
    .handleAction(receievePrivateMessage, (state: State, { payload }
      : ActionType<typeof receievePrivateMessage>) => ({
      ...state,
      dms: {
        ...state.dms,
        [payload.feed]: (state.dms[payload.feed] ?? []).concat(payload).slice(-200),
      },
      unread: new Set(state.unread).add(payload.id),
    }))

    // Read Messages
    .handleAction(readMessages, (state: State, { payload }
      : ActionType<typeof readMessages>) => ({
        ...state,
        unread: new Set(Array.from(state.unread).filter(m => !payload.messages.includes(m))),
      }));
