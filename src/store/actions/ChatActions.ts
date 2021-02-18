import { createAction } from "typesafe-actions";

import * as constants from "../constants";

export interface ReceiveMessagePayload { from: string; message: string; timestamp: Date }
export const receiveMessage = createAction(constants.RECEIVE_MESSAGE,
    (from: string, message: string, timestamp: Date):
    ReceiveMessagePayload => ({ from, message, timestamp }))();

export interface ReceievePrivateMessagePayload { from: string, message: string, timestamp: Date }
export const receievePrivateMessage = createAction(constants.RECEIVE_PRIVATE_MESSAGE,
    (from: string, message: string, timestamp: Date):
    ReceievePrivateMessagePayload => ({ from, message, timestamp }))();
