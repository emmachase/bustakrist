import { store } from "../App";
import { bustGame, startGame } from "../store/actions/GameActions";
import { BalanceResponse } from "./networkInterfaces";
import { RequestCode, UpdateCode } from "./transportCodes";

let activeConnection: Connection;

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
    this.ws.onopen = () => this.connectDebounce = 5;
    this.ws.onclose = () => {
      console.warn(`Lost WS connection, retrying in ${this.connectDebounce}ms...`);
      setTimeout(() => {
        console.warn("Reconnecting...");
        this.connectDebounce = this.connectDebounce*2 + 100;
        this.tryConnection();
      }, this.connectDebounce);
    };
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
    resolve: (data: PromiseLike<any>) => void
    reject: (data: PromiseLike<any>) => void
  }[] = [];
  private handleMessage(event: MessageEvent) {
    const msg = JSON.parse(event.data);
    console.log("Data: ", msg);
    switch (msg.type) {
      case UpdateCode.HELLO:
        this.ws.send(JSON.stringify({
          type: RequestCode.PING,
        }));
        break;

      case UpdateCode.GAME_STARTING:
        store.dispatch(startGame(+new Date() - msg.data.now, msg.data.start));
        break;

      case UpdateCode.BUSTED:
        store.dispatch(bustGame(msg.data.bust, msg.data.hash));
        break;

      case UpdateCode.REPLY:
        console.log(+new Date() - msg.data.now);
        break;

      default:
        console.error("Unknown packet type", msg.type);
    }
  }

  public makeRequest<R>(code: RequestCode, data: unknown): Promise<R> {
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
    return this.makeRequest<BalanceResponse>(RequestCode.REGISTER, {
      name, pass,
    });
  }
}

export function createConnection(host?: string) {
  const url = host ?? window.location.host;
  activeConnection = new Connection("ws://" + url + "/api/sock"); // TODO: WSS
}

export function getConnection() {
  if (activeConnection) {
    return activeConnection;
  } else {
    throw Error("Attempted to getConnection before connection was initialized");
  }
}
