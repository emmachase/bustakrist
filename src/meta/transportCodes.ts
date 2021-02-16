export enum RequestCode {
  PING,
  LOGIN,
  REGISTER,
  GETBAL,
  SENDMSG
}

export enum UpdateCode {
  HELLO,
  REPLY,
  MESSAGE,
  GAME_STARTING,
  BUSTED
}

export enum ErrorCode {
  BANNED,
  MALFORMED,
  UNKNOWN_TYPE,
  INVALID_DATA,
  UNAUTHORIZED
}

export enum ErrorDetail {
  INVALID_JSON,
  TOO_BIG,
  NO_TYPE,
  USERNAME_TAKEN,
  NOT_LOGGED_IN,
  INVALID_CREDENTIALS
}
