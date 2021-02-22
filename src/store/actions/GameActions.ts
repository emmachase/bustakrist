import { createAction } from "typesafe-actions";

import * as constants from "../constants";

export interface StartGamePayload { tdiff: number, start: number, id: number }
export const startGame = createAction(constants.START_GAME,
    (tdiff: number, start: number, id: number): StartGamePayload => ({ tdiff, start, id }))();

export interface BustGamePayload { bust: number, hash: string }
export const bustGame = createAction(constants.BUST_GAME,
    (bust: number, hash: string): BustGamePayload => ({ bust, hash }))();

export interface RoundHistory {
    id: number
    bust: number
    hash: string
    multiplier: number | false | null // False means busted
    bet: number | null
}

export interface LoadHistoryPayload { history: RoundHistory[] }
export const loadHistory = createAction(constants.LOAD_HISTORY,
    (history: RoundHistory[]): LoadHistoryPayload => ({ history }))();
