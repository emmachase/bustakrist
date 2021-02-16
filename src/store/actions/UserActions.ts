import { createAction } from "typesafe-actions";

import * as constants from "../constants";

export interface AuthUserPayload { name: string, bal: number }
export const authUser = createAction(constants.AUTH_USER,
    (name: string, bal: number): AuthUserPayload => ({ name, bal }))();

export interface UpdateBalancePayload { bal: number }
export const updateBalance = createAction(constants.UPDATE_BALANCE,
    (bal: number): UpdateBalancePayload => ({ bal }))();
