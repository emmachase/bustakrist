import { store } from "../App";
import { receievePrivateMessage, receiveMessage } from "../store/actions/ChatActions";
import { bustGame, loadHistory, startGame } from "../store/actions/GameActions";
import { clearPlayerlist, playerCashedout, updatePlaying,
  wagerAdd, wagerAddBulk } from "../store/actions/PlayersActions";
import { addFriends, authUser, logoutUser, updateBalance } from "../store/actions/UserActions";
import { Subject } from "../util/Subject";
import { MINUTE, SECOND } from "../util/time";
import { AuthResponse, BalanceResponse,
  ProfileBetsResponse, ProfileResponse, WithdrawResponse } from "./networkInterfaces";
import { ErrorCode, ErrorDetail, RequestCode, UpdateCode } from "./transportCodes";

let activeConnection: Connection;

export const GameStream = new Subject<{ start: number }>();
export const TipStream = new Subject<{ from: string, to: string, amount: number }>();
export const TipToStream = new Subject<{ to: string, amount: number }>();
export const AlertStream = new Subject();

export class Connection {
  private ws!: WebSocket;

  private idCounter = 0;
  private genID(): number {
    // The ORZ will wrap as a 32 bit int, which is desirable
    return this.idCounter = (this.idCounter + 1) | 0;
  }


  public constructor(private url: string) {
    this.tryConnection();
  }

  private connectDebounce = 5;
  private tryConnection() {
    this.ws = new WebSocket(this.url);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onopen = async () => {
      this.connectDebounce = 5;

      const token = localStorage.getItem("reauth");
      if (token) {
        const res = await this.reauth(token);
        if (res.user) {
          store.dispatch(authUser(res.user, res.bal));
          store.dispatch(addFriends(res.friends));
        }
      }
    };
    this.ws.onclose = () => {
      store.dispatch(logoutUser());

      console.warn(`Lost WS connection, retrying in ${this.connectDebounce}ms...`);
      setTimeout(() => {
        console.warn("Reconnecting...");
        this.connectDebounce = Math.min(this.connectDebounce*2 + 100, 10*SECOND);
        this.tryConnection();
      }, this.connectDebounce);
    };
  }

  public get active() {
    return this.ws.readyState === 1;
  }

  public sendRaw(data: unknown) {
    if (this.ws.readyState === 1) {
      this.ws.send(JSON.stringify(data));
    } else {
      this.ws.close();
      this.tryConnection();
    }
  }

  private activeRequests: {
    id: number
    resolve: (data: any) => void
    reject: (data: any) => void
  }[] = [];
  private handleMessage(event: MessageEvent) {
    const msg = JSON.parse(event.data);
    switch (msg.type) {
      case UpdateCode.HELLO:
        this.ws.send(JSON.stringify({
          type: RequestCode.PING,
        }));
        break;

      case UpdateCode.HISTORY:
        store.dispatch(loadHistory(msg.data.history));
        break;

      case UpdateCode.GAME_STARTING:
        const adjustment = +new Date() - msg.data.now;
        store.dispatch(startGame(adjustment, msg.data.start, msg.data.gameid));
        store.dispatch(updateBalance(msg.data.newBal));
        store.dispatch(clearPlayerlist());
        setTimeout(() => {
          GameStream.next({
            start: msg.data.start + adjustment,
          });
        }, 0);
        break;

      case UpdateCode.BUSTED:
        store.dispatch(bustGame(msg.data.bust, msg.data.hash));
        store.dispatch(updateBalance(msg.data.newBal));
        break;

      case UpdateCode.UPDATE_BALANCE:
        store.dispatch(updateBalance(msg.data.newBal));
        break;

      case UpdateCode.RECIEVE_TIP:
        store.dispatch(updateBalance(msg.data.newBal));
        TipStream.next(msg.data);
        break;

      case UpdateCode.ALERT_SAFETY:
        AlertStream.next(null);
        break;

      case UpdateCode.MESSAGE:
        if (msg.data.private) {
          store.dispatch(receievePrivateMessage(
              msg.data.from,
              msg.data.message,
              new Date(msg.data.timestamp),
              msg.data.feed,
          ));
        } else {
          store.dispatch(receiveMessage(
              msg.data.from,
              msg.data.message,
              new Date(msg.data.timestamp),
          ));
        }

        break;

      case UpdateCode.UPDATE_PLAYING:
        store.dispatch(updatePlaying(msg.data.playing));
        break;

      case UpdateCode.ADD_PLAYER: {
        const data = msg.data;
        store.dispatch(wagerAdd(data.name, data.wager));
        break;
      }

      case UpdateCode.ADD_ALL_PLAYERS:
        store.dispatch(wagerAddBulk(msg.data.players));
        break;

      case UpdateCode.PLAYER_CASHEDOUT: {
        const data = msg.data;
        store.dispatch(playerCashedout(data.name, data.cashout));
        break;
      }

      case UpdateCode.REPLY:
        const handlerIdx = this.activeRequests.findIndex(r => r.id === msg.id);
        if (handlerIdx !== -1) {
          const handler = this.activeRequests[handlerIdx];
          if (msg.ok) {
            handler.resolve(msg.data);
          } else {
            handler.reject({
              errorType: msg.errorType,
              error: msg.error,
              data: msg.data,
            });
          }
        }

        break;

      default:
        console.error("Unknown packet type", msg.type);
    }
  }

  public makeRequest<R>(code: RequestCode, data?: unknown): Promise<R> {
    return new Promise((resolve, reject) => {
      const id = this.genID();
      this.activeRequests.push({
        id, resolve, reject,
      });

      this.sendRaw({
        id, data,
        type: code,
      });
    });
  }


  public register(name: string, pass: string) {
    return this.makeRequest<AuthResponse>(RequestCode.REGISTER, {
      name, pass,
    });
  }

  public login(name: string, pass: string) {
    return this.makeRequest<AuthResponse>(RequestCode.LOGIN, {
      name, pass,
    });
  }

  public reauth(token: string) {
    return this.makeRequest<AuthResponse>(RequestCode.REAUTH, {
      t: token,
    });
  }

  public logout() {
    return this.makeRequest(RequestCode.LOGOUT);
  }


  // Social
  public sendMessage(msg: string, to?: string) {
    return this.makeRequest(RequestCode.SENDMSG, {
      msg, to,
    });
  }

  public getProfile(user: string) {
    return this.makeRequest<ProfileResponse>(RequestCode.PROFILE, {
      user,
    });
  }

  public getProfileBets(user: string, page: number) {
    return this.makeRequest<ProfileBetsResponse>(RequestCode.PROFILE_BETS, {
      user, page,
    });
  }

  public updateFriend(user: string, action: boolean) {
    return this.makeRequest(RequestCode.UPDATE_FRIEND, {
      name: user, action,
    });
  }

  public sendTip(user: string, amount: number) {
    return this.makeRequest(RequestCode.TIP, {
      to: user, amount,
    });
  }

  public withdrawKrist(to: string, amount: number) {
    return this.makeRequest<WithdrawResponse>(RequestCode.WITHDRAW, {
      to, amount,
    });
  }

  // Game
  public async makeBet(wager: number, cashout: number) {
    const res = await this.makeRequest<{ newBal: number }>(RequestCode.COMMIT_WAGER, {
      bet: wager, cashout,
    });

    store.dispatch(updateBalance(res.newBal));

    return res;
  }

  public pulloutBet() {
    return this.makeRequest(RequestCode.PULLOUT_WAGER);
  }
}

export function createConnection(host?: string) {
  const url = host ?? window.location.host;
  const proto = window.location.protocol;
  const wsProto = proto.startsWith("https") ? "wss://" : "ws://";
  activeConnection = new Connection(wsProto + url + "/api/sock");
}

export function getConnection() {
  if (activeConnection) {
    return activeConnection;
  } else {
    throw Error("Attempted to getConnection before connection was initialized");
  }
}

export interface RequestError {
  ok: false,
  errorType: ErrorCode,
  error: ErrorDetail
}

export function isRequestError(x: unknown): x is RequestError {
  if (typeof x === "object") {
    const err = x as RequestError;
    if (err.error && err.errorType) return true;
  }

  return false;
}
