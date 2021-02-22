import React, { FC, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Modal, ModalElement } from "../../components/modal";
import { getConnection } from "../../meta/connection";
import { ProfileBetsResponse, ProfileResponse } from "../../meta/networkInterfaces";
import { suspend } from "../../util/promise";
import { ErrorBoundary } from "react-error-boundary";
import { formatFixed2 } from "../../util/score";
import { DateTime } from "luxon";
import "./PlayerModal.scss";
import { BlockSkeleton } from "../../components/skeletons";
import { CartesianGrid, Legend, Line, LineChart,
  ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Flexor } from "../flex";
import { KButton } from "../../components/form";

function useProfile(username: string): () => ProfileResponse {
  return useMemo(() => suspend(getConnection().getProfile(username)), [username]);
}

function useProfileBets(
  username: string,
  page: number,
): () => ProfileBetsResponse | undefined {
  const [s, setS] = useState<ProfileBetsResponse>();
  useMemo(() =>
    getConnection().getProfileBets(username, page)
      .then(d => setS(d))
  , [username, page]);

  return () => s;
}

const PlayerChart: FC<{
  page: number
  profile: ProfileResponse
  readBets: () => ProfileBetsResponse | undefined
  onNavigate: (dx: number) => void
}> = (props) => {
  const [t] = useTranslation();

  const bets = props.readBets();
  if (!bets) return <BlockSkeleton className="bet-chart" height="20rem" />;

  const erev = [...bets.entities].reverse();

  const KTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const bet = bets.entities.find(e => e.id === label);
      if (!bet) return null;
      // props.profile.
      return (
        <div className="chart-tooltip">
          <div className="label">{t("profile.specificGame", { game: bet.game })}</div>
          <div className="label">{t("profile.specificWager", { wager: bet.bet })}</div>
          { bet.cashout
          ? <><div className="label c-win">
              {t("profile.specificCashout", { cashout: formatFixed2(bet.cashout) })}
            </div><div className="label c-win">
              {t("profile.specificProfit", {
                profit: formatFixed2(bet.cashout*bet.bet - 100*bet.bet),
              })}
            </div></>

          : <><div className="label c-lose">
              {t("profile.gameBusted", { bust: formatFixed2(bet.busted) })}
            </div><div className="label c-lose">
              {t("profile.specificLoss", { loss: bet.bet })}
            </div></>
          }
          <div className="label">{t("profile.specificNet",
            { net: formatFixed2(bet.newBalance - props.profile.netBase) })}
          </div>
          <div className="label subtle">{t("profile.playedAgo",
            { ago: DateTime.fromMillis(bet.timestamp).toRelative() })}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bet-chart">
      <ResponsiveContainer width="100%" aspect={2/1}>
        <LineChart
          data={erev.map(e => ({
            id: e.id,
            newBalance: e.newBalance/100,
            net: (e.newBalance - props.profile.netBase)/100,
          }))}
          margin={{
            top: 5,
            right: 35,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#fff4" vertical={false} />
          <XAxis dataKey="id" stroke="#fff7" />
          <YAxis stroke="#fff7" />
          <Tooltip isAnimationActive={false} content={<KTooltip/>} />
          {/* <Legend /> */}
          <ReferenceLine y={0} stroke="#fff7" />
          <Line type="monotone" dataKey="net" stroke="#8884d8"  />
          {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
        </LineChart>
      </ResponsiveContainer>
      <Flexor justify="space-around">
        <KButton disabled={!bets.more} onClick={() => props.onNavigate(1)}>
          {t("profile.previousPage")}
        </KButton>
        <KButton disabled={props.page === 0} onClick={() => props.onNavigate(-1)}>
          {t("profile.nextPage")}
        </KButton>
      </Flexor>
    </div>
  );
};

const PlayerModalContent: FC<{
  user: string
  readProfile: () => ProfileResponse
  setJoined: (joined: string) => void
}> = (props) => {
  const [t] = useTranslation();
  const profile = props.readProfile();

  const [graphPage, setGraphPage] = useState(0);
  const profileBets = useProfileBets(props.user, graphPage);

  useEffect(() => {
    props.setJoined(DateTime.fromMillis(profile.joined).toRelative() ?? "Invalid Date");
  }, [profile.joined]);

  const InfoSlot = (props: { label: string, value: string }) =>
    <div className="i-slot">
      <span className="label">{props.label}</span>
      &nbsp;
      <span className="value">{props.value}</span>
    </div>;

  return (
    <div>
      { profile.gamesPlayed !== 0 ?
        <>
          <div className="player-stats">
            <InfoSlot label={t("profile.net")}
              value={formatFixed2(profile.balance - profile.netBase)
                    + t("game.currencyShortname")}/>
            <InfoSlot label={t("profile.totalWagered")}
              value={profile.totalWagered.toLocaleString() + t("game.currencyShortname")}/>
            <InfoSlot label={t("profile.gamesPlayed")}
              value={profile.gamesPlayed.toLocaleString()}/>
          </div>
          <div className="player-stats">
            <InfoSlot label={t("profile.allTimeLow")}
              value={formatFixed2(profile.allTimeLow  - profile.netBase)
                    + t("game.currencyShortname")}/>

            <InfoSlot label={t("profile.allTimeHigh")}
              value={formatFixed2(profile.allTimeHigh - profile.netBase)
                    + t("game.currencyShortname")}/>
          </div>

          <Suspense fallback={
            <BlockSkeleton className="bet-chart" height="20rem" />
          }>
            <PlayerChart
              page={graphPage}
              profile={profile}
              readBets={profileBets}
              onNavigate={dx => setGraphPage(graphPage + dx)}
            />
          </Suspense>
        </> :
        <>
          <h2 className="t-center">User has no betting history.</h2>
        </>
      }
    </div>
  );
};

export const PlayerModal: (props: {
  user: string
}) => ModalElement = (props) => {
  const [t] = useTranslation();
  const profile = useProfile(props.user);

  const [joined, setJoined] = useState<string>();

  return (
    <Modal className="player-modal">
      <Modal.Header close rightContent={
        joined ? <span className="detail">{t("profile.joined", { joined })}</span> : undefined
      }>
        <Trans i18nKey="profile.profileHeader">
          User Profile: <strong>{{ user: props.user }}</strong>
        </Trans>
      </Modal.Header>
      <Modal.Content>
        <ErrorBoundary fallback={<h3>{t("profile.failedFetch")}</h3>}>
          <PlayerModalContent user={props.user} readProfile={profile} setJoined={setJoined}/>
        </ErrorBoundary>
      </Modal.Content>
    </Modal>
  );
};
