import { createAction } from "typesafe-actions";

import * as constants from "../constants";

export interface PlayerStake {
  name: string,
  wager: number,
  multiplier?: number
  // profit can be implied
}

export interface ClearPlayerlistPayload {}
export const clearPlayerlist = createAction(constants.CLEAR_PLAYERLIST,
    (): ClearPlayerlistPayload => ({}))();

export interface WagerAddPayload { name: string; wager: number }
export const wagerAdd = createAction(constants.ADD_NET_WAGER,
    (name: string, wager: number):
    WagerAddPayload => ({ name, wager }))();

export interface WagerAddBulkPayload { players: {name: string; wager: number, cashout: number}[] }
export const wagerAddBulk = createAction(constants.ADD_NET_WAGER_BULK,
    (players): WagerAddBulkPayload => ({ players }))();

export interface PlayerCashedoutPayload { name: string; cashout: number }
export const playerCashedout = createAction(constants.PLAYER_CASHEDOUT,
    (name: string, cashout: number):
    PlayerCashedoutPayload => ({ name, cashout }))();

export interface UpdatePlayingPayload { playing: boolean }
export const updatePlaying = createAction(constants.UPDATE_PLAYING,
    (playing: boolean): UpdatePlayingPayload => ({ playing }))();
