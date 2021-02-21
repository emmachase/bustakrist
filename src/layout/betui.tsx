import React, { FC, MutableRefObject, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import useAnimationFrame from "use-animation-frame";
import { KButton, NumericalInput } from "../components/form";
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
  bet: number, cashout: number
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
      <KButton card
        onClick={async () => {
          await getConnection().makeBet(props.bet, props.cashout);
        }}>{t("bet.betAction")}</KButton>
    );
  }
};

export function BetUI() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const [amt, setAmt] = useState(1);
  const [cashout, setCashout] = useState(200);

  const betButton = () => {

  };

  return (
    <Flexor fill direction="column">
      <NumericalInput
        label={t("bet.betAmt")}
        suffix={t("game.currencyShortname")}
        suffixTooltip={t("game.currency")}
        initialValue={amt}
        onChange={v => setAmt(v)}
        reformatter={v => (+v ? +v : 1).toFixed(0)}
      />
      <NumericalInput
        label={t("bet.betPayout")}
        suffix="&times;"
        initialValue={cashout/100}
        onChange={v => setCashout(Math.floor(100*v))}
        reformatter={v => (+v ? +v : 2).toFixed(2)}
      />

      <Spacer/>

      <BetButton bet={amt} cashout={cashout}/>
    </Flexor>
  );
}
