import { createAction } from "typesafe-actions";
import { Moment } from "moment";

import * as constants from "../constants";

export interface StartGamePayload { start: Moment }
export const startGame = createAction(constants.START_GAME,
    (start): StartGamePayload => ({ start }))();

export interface BustGamePayload { bust: number }
export const bustGame = createAction(constants.BUST_GAME,
    (bust): BustGamePayload => ({ bust }))();
