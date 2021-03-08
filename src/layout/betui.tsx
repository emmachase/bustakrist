import React, { FC, MutableRefObject, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import useAnimationFrame from "use-animation-frame";
import { KButton, KInput } from "../components/form";
import { getConnection } from "../meta/connection";
import { updateBalance } from "../store/actions/UserActions";
import { useKState } from "../util/types";
import { Flexor, Spacer } from "./flex";
import { DisconnectOutlined, SketchOutlined } from "@ant-design/icons";
import { getTimeDiff, usePerfOff } from "../hooks/time";
import { formatScore, scoreFunction } from "../util/score";
import { playSound } from "../audio/AudioManager";

// enum BetState {
//   NOT_BETTING,
//   BETTING_PENDING,
//   BETTING,
// }

const BetButton: FC<{
  bet: number, cashout: number, disabled: boolean
}> = (props) => {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const tdiff = useKState(s => s.game.tdiff);
  const nextStart = useKState(s => s.game.start);

  const user = useKState(s => s.user.name);
  const userIsPlaying = useKState(s => s.players.userIsPlaying);
  const currentPlayers = useKState(s => s.players.players);
  const inActiveGame = currentPlayers.find(p => p.name === user);

  // const [betState, setBetState] = useState(BetState.NOT_BETTING);
  const [pullDisabled, setDisabled] = useState(true);
  const profitSpan = useRef() as MutableRefObject<HTMLSpanElement>;

  const perfOff = usePerfOff();
  useAnimationFrame(() => {
    const timeDiff = getTimeDiff(perfOff, nextStart, tdiff);
    if (pullDisabled && timeDiff >= 0) {
      setDisabled(false);
    }

    if (timeDiff >= 0 && profitSpan.current) {
      const el = profitSpan.current;
      const payout = scoreFunction(timeDiff)*(inActiveGame?.wager ?? 0);
      el.innerText = formatScore(payout);
    }
  });

  const timeDiff = getTimeDiff(perfOff, nextStart, tdiff);
  if (inActiveGame && timeDiff < 0 && !pullDisabled) {
    setDisabled(true);
  }

  if (userIsPlaying === "active") {
    return (
      <KButton card
        disabled={pullDisabled}
        onClick={async () => {
          await getConnection().pulloutBet();
        }}>{
          pullDisabled
            ? t("bet.betAction")
            : <><SketchOutlined /> <span ref={profitSpan}></span>{t("game.currencyShortname")}</>
        }</KButton>
    );
  } else if (userIsPlaying) {
    return (
      <KButton card
        onClick={async () => {
          await getConnection().pulloutBet();
        }}><DisconnectOutlined /> {t("bet.betAction")} ({t("bet.cancel")})</KButton>
    );
  } else {
    return (
      <KButton card disabled={props.disabled}
        onClick={async () => {
          await getConnection().makeBet(props.bet, props.cashout);
        }}>{t("bet.betAction")}</KButton>
    );
  }
};

export function BetUI() {
  const [t] = useTranslation();

  const userBalance = useKState(s => s.user.bal);
  const userIsPlaying = useKState(s => s.players.userIsPlaying);

  const [amt, setAmt] = useState(1);
  const [cashout, setCashout] = useState(200);

  const betAction = async () => {
    if (userIsPlaying === false) {
      await getConnection().makeBet(amt, cashout);
    } else {
      await getConnection().pulloutBet();
    }
  };

  const [betError, setBetError] = useState<string | null>(null);
  const [cashoutError, setCashoutError] = useState<string | null>(null);

  const checkAmt = (val: number) => {
    if (val < 1) {
      setBetError(t("errors.atLeastOne"));
    } else if (val*100 > (userBalance ?? 0)) {
      setBetError(t("errors.lowBalance"));
    } else {
      setBetError(null);
    }
  };

  const checkCashout = (val: number) => {
    if (val <= 100) {
      setCashoutError(t("errors.atLeastOneHundred"));
    } else {
      setCashoutError(null);
    }
  };

  useEffect(() => {
    checkAmt(amt);
  }, [userBalance]);

  return (
    <Flexor fill direction="column">
      <KInput
        label={t("bet.betAmt")}
        suffix={t("game.currencyShortname")}
        suffixTooltip={t("game.currency")}
        initialValue={amt}
        onChange={v => (setAmt(+v), checkAmt(+v))}
        reformatter={v => (+v ? +v : 1).toFixed(0)}
        onFinish={betAction}
        error={userIsPlaying ? null : betError}
        disabled={true && !!userIsPlaying}
      />
      <KInput
        label={t("bet.betPayout")}
        suffix="&times;"
        initialValue={cashout/100}
        onChange={v => (setCashout(Math.floor(100*+v)), checkCashout(100*+v))}
        reformatter={v => (+v ? +v : 2).toFixed(2)}
        onFinish={betAction}
        error={userIsPlaying ? null : cashoutError}
        disabled={true && !!userIsPlaying}
      />

      <Spacer/>

      <BetButton bet={amt} cashout={cashout}
        disabled={ userIsPlaying ? false : !!(betError || cashoutError) }/>
    </Flexor>
  );
}
