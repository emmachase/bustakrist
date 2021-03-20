import { createAction } from "typesafe-actions";

import * as constants from "../constants";

export interface ReceiveMessagePayload {
  id: string, from: string; message: string; timestamp: Date
}
export const receiveMessage = createAction(constants.RECEIVE_MESSAGE,
    (id: string, from: string, message: string, timestamp: Date):
    ReceiveMessagePayload => ({ id, from, message, timestamp }))();

export interface ReceievePrivateMessagePayload {
  id: string, from: string, message: string, timestamp: Date, feed: string
}
export const receievePrivateMessage = createAction(constants.RECEIVE_PRIVATE_MESSAGE,
    (id: string, from: string, message: string, timestamp: Date, feed: string):
    ReceievePrivateMessagePayload => ({ id, from, message, timestamp, feed }))();

export interface ReadMessagesPayload {
  messages: string[],
}
export const readMessages = createAction(constants.READ_MESSAGES,
    (messages: string[]): ReadMessagesPayload => ({ messages }))();
