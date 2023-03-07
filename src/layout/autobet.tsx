import { GameStream, getConnection } from "../meta/connection";
import { CancelSubscription } from "../util/Subject";
import { KInput, FormContext, useFormController, KButton,
  requiredValidator, balanceValidator, reformatters, minValidator } from "../components/form";
import { useTranslation } from "react-i18next";
import { useKState } from "../util/types";
import { BetButton } from "./betui";
import { Flexor, Spacer } from "./flex";
import { useEffect, useRef, useState } from "react";
import { ErrorDetail } from "../meta/transportCodes";
import { ToastSink } from "../components/aesthetic/tips";
import { store } from "../App";
import { playSound } from "../audio/AudioManager";

export interface PlannedBet {
  cancelled: boolean;
  bet: number;
  cashout: number;
}

export abstract class AutoBetHook<P> {
  private running: boolean = false;
  private subscriptions: CancelSubscription[] = [];

  public displayMessage = (_key: string) => {};

  private lastBust = 0;
  public constructor(private setRunning: (running: boolean) => void) {
    this.subscriptions.push(GameStream.subscribe(async () => {
      if (this.running) {
        const betPlan = this.onBet();
        if (!betPlan.cancelled) {
          const bet = Math.floor(betPlan.bet);
          const cashout = Math.round(100*betPlan.cashout);
          try {
            await getConnection().makeBet(bet, cashout);
          } catch (e) {
            if (e.error === ErrorDetail.LOW_BALANCE) {
              this.toggle();
              this.displayMessage("errors.autoStopFromBalance");
              playSound("autobet-fail");
            }
          }
        }
      }
    }));

    this.subscriptions.push(store.subscribe(() => {
      const { user: { name }, game: { bust } } = store.getState();
      if (this.lastBust === 0 && bust) {
        const stake = store.getState().players.players.find(p => p.name === name);
        const won = !!stake?.multiplier;
        if (stake) {
          this.onRoundEnd(won, Math.round((stake.multiplier ?? 0)*stake.wager - 100*stake.wager));
        }
      }

      this.lastBust = bust;
    }));
  }

  public unload() {
    this.subscriptions.forEach(s => s());
  }

  public async toggle(): Promise<void> {
    if (this.running) {
      this.running = false;
      this.setRunning(false);
    } else {
      this.running = true;
      this.setRunning(true);
      this.onBegin();

      try {
        const betPlan = this.onBet();
        if (!betPlan.cancelled) {
          const bet = Math.floor(betPlan.bet);
          const cashout = Math.round(100*betPlan.cashout);
          await getConnection().makeBet(bet, cashout);
        }
      } catch {}
    }
  }

  public isRunning(): boolean {
    return this.running;
  }

  public abstract changeParameters(params: P): void;
  protected abstract onBegin(): void;
  protected abstract onRoundEnd(won: boolean, profit: number): void;
  protected abstract onBet(): PlannedBet;
}

/* ------------------------------ Flat Strategy ----------------------------- */

export class FlatBetHook extends AutoBetHook<{
  bet: number;
  cashout: number;
}> {
  private bet!: number;
  private cashout!: number;

  public changeParameters(params: { bet: number; cashout: number; }): void {
    this.bet = params.bet;
    this.cashout = params.cashout;
  }

  protected onBegin(): void {
    // Nothing to do...
  }

  protected onRoundEnd(): void {
    // Nothing to do...
  }

  protected onBet(): PlannedBet {
    return {
      cancelled: false,
      bet: this.bet,
      cashout: this.cashout,
    };
  }
}

export function FlatBetUI() {
  const [running, setRunning] = useState(false);
  const betHook = useRef<FlatBetHook>();
  useEffect(() => {
    const hook = new FlatBetHook(setRunning);
    betHook.current = hook;
    return () => hook.unload();
  }, []);

  const balance = useKState(s => s.user.bal);

  const [t] = useTranslation();
  const formCtx = useFormController(() => ({
    bet: 1, cashout: 2,
  }), [balance]);

  if (betHook.current) {
    betHook.current.displayMessage = (key) => {
      ToastSink.next({
        text: t(key),
        time: 8,
      });
    };
  }

  return (
    <FormContext.Provider value={formCtx}>
      <KInput
        disabled={running}
        label={t("bet.betAmt")}
        suffix={t("game.currencyShortname")}
        name="bet"
        validators={[
          requiredValidator(t("errors.required")),
          balanceValidator(balance, t("errors.lowBalance"), t("errors.atLeastOne")),
        ]}
        reformatter={reformatters.int}
      />

      <KInput
        disabled={running}
        label={t("bet.betPayout")}
        suffix="&times;"
        name="cashout"
        validators={[
          requiredValidator(t("errors.required")),
          minValidator(1.01, t("errors.atLeastOneHundred")),
        ]}
        reformatter={reformatters.dec2}
      />

      <Spacer/>

      <Flexor>
        <BetButton disallowBets />

        <KButton requireValid={!running} card className="ml-3"
          disabled={!running && formCtx.getState().bet*100 > (balance ?? 0)}
          onClick={() => {
            betHook.current?.changeParameters({
              bet: formCtx.getState().bet,
              cashout: formCtx.getState().cashout,
            });

            betHook.current?.toggle();
          }}
        >
          {running
            ? t("bet.autoui.stop")
            : t("bet.autoui.start")}
        </KButton>
      </Flexor>
    </FormContext.Provider>
  );
}

/* --------------------------- Martingale Strategy -------------------------- */

export class MartingaleBetHook extends AutoBetHook<{
  bet: number;
  cashout: number;
}> {
  private baseBet!: number;
  private currentBet!: number;

  public changeParameters(params: { bet: number; }): void {
    this.baseBet = params.bet;
  }

  protected onBegin(): void {
    this.currentBet = this.baseBet;
  }

  protected onRoundEnd(won: boolean): void {
    if (won) {
      this.currentBet = this.baseBet;
    } else {
      this.currentBet *= 2;
    }
  }

  protected onBet(): PlannedBet {
    return {
      cancelled: false,
      bet: this.currentBet,
      cashout: 2,
    };
  }
}

export function MartingaleBetUI() {
  const [running, setRunning] = useState(false);
  const betHook = useRef<MartingaleBetHook>();
  useEffect(() => {
    const hook = new MartingaleBetHook(setRunning);
    betHook.current = hook;
    return () => hook.unload();
  }, []);

  const balance = useKState(s => s.user.bal);

  const [t] = useTranslation();
  const formCtx = useFormController(() => ({
    bet: 1,
  }), [balance]);

  if (betHook.current) {
    betHook.current.displayMessage = (key) => {
      ToastSink.next({
        text: t(key),
        time: 8,
      });
    };
  }

  return (
    <FormContext.Provider value={formCtx}>
      <KInput
        disabled={running}
        label={t("bet.betAmt")}
        suffix={t("game.currencyShortname")}
        name="bet"
        validators={[
          requiredValidator(t("errors.required")),
          balanceValidator(balance, t("errors.lowBalance"), t("errors.atLeastOne")),
        ]}
        reformatter={reformatters.int}
      />

      <Spacer/>

      <Flexor>
        <BetButton disallowBets />

        <KButton requireValid={!running} card className="ml-3"
          disabled={!running && formCtx.getState().bet*100 > (balance ?? 0)}
          onClick={() => {
            betHook.current?.changeParameters({
              bet: formCtx.getState().bet,
            });

            betHook.current?.toggle();
          }}
        >
          {running
            ? t("bet.autoui.stop")
            : t("bet.autoui.start")}
        </KButton>
      </Flexor>
    </FormContext.Provider>
  );
}

/* --------------------------- Reverse Martingale Strategy -------------------------- */

export class ReverseMartingaleBetHook extends AutoBetHook<{
  bet: number;
  cashout: number;
}> {
  private baseBet!: number;
  private currentBet!: number;

  public changeParameters(params: { bet: number; }): void {
    this.baseBet = params.bet;
  }

  protected onBegin(): void {
    this.currentBet = this.baseBet;
  }

  protected onRoundEnd(won: boolean): void {
    if (won) {
      this.currentBet *= 2;
    } else {
      this.currentBet = this.baseBet;
    }
  }

  protected onBet(): PlannedBet {
    return {
      cancelled: false,
      bet: this.currentBet,
      cashout: 2,
    };
  }
}

export function ReverseMartingaleBetUI() {
  const [running, setRunning] = useState(false);
  const betHook = useRef<ReverseMartingaleBetHook>();
  useEffect(() => {
    const hook = new ReverseMartingaleBetHook(setRunning);
    betHook.current = hook;
    return () => hook.unload();
  }, []);

  const balance = useKState(s => s.user.bal);

  const [t] = useTranslation();
  const formCtx = useFormController(() => ({
    bet: 1,
  }), [balance]);

  if (betHook.current) {
    betHook.current.displayMessage = (key) => {
      ToastSink.next({
        text: t(key),
        time: 8,
      });
    };
  }

  return (
    <FormContext.Provider value={formCtx}>
      <KInput
        disabled={running}
        label={t("bet.betAmt")}
        suffix={t("game.currencyShortname")}
        name="bet"
        validators={[
          requiredValidator(t("errors.required")),
          balanceValidator(balance, t("errors.lowBalance"), t("errors.atLeastOne")),
        ]}
        reformatter={reformatters.int}
      />

      <Spacer/>

      <Flexor>
        <BetButton disallowBets />

        <KButton requireValid={!running} card className="ml-3"
          disabled={!running && formCtx.getState().bet*100 > (balance ?? 0)}
          onClick={() => {
            betHook.current?.changeParameters({
              bet: formCtx.getState().bet,
            });

            betHook.current?.toggle();
          }}
        >
          {running
            ? t("bet.autoui.stop")
            : t("bet.autoui.start")}
        </KButton>
      </Flexor>
    </FormContext.Provider>
  );
}

/* --------------------------- Split Martingale Strategy -------------------------- */

export class SplitMartingaleBetHook extends AutoBetHook<{
  target: number;
  splits: number;
}> {
  private target!: number;
  private splits!: number
  private splitBook: number[] = [];

  public changeParameters(params: { target: number; splits: number; }): void {
    this.target = params.target;
    this.splits = params.splits;
  }

  protected onBegin(): void {
    let error = 0;

    const targetSplit = this.target / this.splits;
    const floorSplit = Math.floor(targetSplit);

    this.splitBook = [];
    for (let i = 0; i < this.splits; i++) {
      this.splitBook.push(floorSplit);
      error += targetSplit - floorSplit;
    }

    error = Math.round(error);
    for (let i = 0; i < error; i++) {
      this.splitBook[i] += 1;
    }
  }

  protected onRoundEnd(won: boolean, profit: number): void {
    if (won) {
      if (this.splitBook.length > 2) {
        this.splitBook.shift();
        this.splitBook.pop();
      } else {
        this.splitBook = [];
        this.toggle();
        this.displayMessage("bet.autoui.strats.splitmartingale.finished");
        playSound("autobet-success");
      }
    } else {
      // In a loss, the profit will always be an integer
      // but we round anyways because who knows what the
      // fuck floating point is up to...
      this.splitBook.push(-Math.round(profit / 100));
    }
  }

  protected onBet(): PlannedBet {
    if (this.splitBook.length > 1) {
      const bet = this.splitBook[0] + this.splitBook[this.splitBook.length - 1];

      return {
        cancelled: false,
        bet: bet,
        cashout: 2,
      };
    } else {
      return {
        cancelled: false,
        bet: this.splitBook[0],
        cashout: 2,
      };
    }
  }
}

export function SplitMartingaleBetUI() {
  const [running, setRunning] = useState(false);
  const betHook = useRef<SplitMartingaleBetHook>();
  useEffect(() => {
    const hook = new SplitMartingaleBetHook(setRunning);
    betHook.current = hook;
    return () => hook.unload();
  }, []);

  const balance = useKState(s => s.user.bal);

  const [t] = useTranslation();
  const formCtx = useFormController(() => ({
    target: 50,
    splits: 10,
  }), [balance]);

  if (betHook.current) {
    betHook.current.displayMessage = (key) => {
      ToastSink.next({
        text: t(key),
        time: 8,
      });
    };
  }

  return (
    <FormContext.Provider value={formCtx}>
      <KInput
        disabled={running}
        label={t("bet.betTarget")}
        suffix={t("game.currencyShortname")}
        name="target"
        validators={[
          requiredValidator(t("errors.required")),
          minValidator(1, t("errors.atLeastOneTarget")),
        ]}
        reformatter={reformatters.int}
      />

      <KInput
        disabled={running}
        label={t("bet.betSplits")}
        name="splits"
        validators={[
          requiredValidator(t("errors.required")),
          minValidator(2, t("errors.atLeastTwoSplits")),
          (v) => {
            const splits = Math.floor(+v);
            const target = formCtx.getState().target;
            const requiredBalance = Math.ceil(target / splits);

            if (requiredBalance > (balance ?? 0)) {
              return [false, t("errors.lowBalance")];
            }

            if (Math.floor(target / splits) === 0) {
              return [false, t("errors.splitLessThanOne")];
            }

            return [true, null];
          },
        ]}
        reformatter={reformatters.int}
      />

      <Spacer/>

      <Flexor>
        <BetButton disallowBets />

        <KButton requireValid={!running} card className="ml-3"
          onClick={() => {
            betHook.current?.changeParameters({
              target: formCtx.getState().target,
              splits: formCtx.getState().splits,
            });

            betHook.current?.toggle();
          }}
        >
          {running
            ? t("bet.autoui.stop")
            : t("bet.autoui.start")}
        </KButton>
      </Flexor>
    </FormContext.Provider>
  );
}
