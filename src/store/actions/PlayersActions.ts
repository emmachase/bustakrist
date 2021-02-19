import { createAction } from "typesafe-actions";

import * as constants from "../constants";

export interface WagerAddPayload { name: string; wager: number }
export const wagerAdd = createAction(constants.RECEIVE_MESSAGE,
    (name: string, wager: number):
    WagerAddPayload => ({ name, wager }))();

export interface PlayerStake {
  name: string,
  wager: number,
  multiplier?: number
  // profit can be implied
}