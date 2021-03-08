import React, { FC, useEffect, useMemo, useState, Suspense, useContext } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Modal, ModalContext, ModalElement } from "../../components/modal";
import { getConnection, isRequestError, TipToStream } from "../../meta/connection";
import { ProfileBetsResponse, ProfileResponse } from "../../meta/networkInterfaces";
import { suspend } from "../../util/promise";
import { ErrorBoundary } from "react-error-boundary";
import { formatFixed2 } from "../../util/score";
import { DateTime } from "luxon";
import "./PlayerModal.scss";
import { BlockSkeleton } from "../../components/skeletons";
import { CartesianGrid, Tooltip as ChartTooltip, Line, LineChart,
  ReferenceLine,
  ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Flexor, Spacer } from "../flex";
import { KButton, KInput } from "../../components/form";
import { useKState } from "../../util/types";
import { UserAddOutlined, UserDeleteOutlined, GiftOutlined } from "@ant-design/icons";
import { Tooltip } from "../../components/pop";
import { useDispatch } from "react-redux";
import { addFriends, removeFriend, updateBalance } from "../../store/actions/UserActions";
import { ErrorDetail } from "../../meta/transportCodes";
import { clazz } from "../../util/class";
import { Subject } from "../../util/Subject";

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
  const edata = erev.map(e => ({
    id: e.id,
    newNetBalance: e.newNetBalance/100,
  }));

  if (edata[0].id === 1) {
    // Insert a genesis game to show zero net
    edata.unshift({ id: 0, newNetBalance: 0 });
  }

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
            { net: formatFixed2(bet.newNetBalance) })}
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
          data={edata}
          margin={{
            top: 5,
            right: 35,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#fff4" vertical={false} />
          <XAxis dataKey="id" stroke="#fff7" />
          <YAxis stroke="#fff7" />
          <ChartTooltip isAnimationActive={false} content={<KTooltip/>} />
          {/* <Legend /> */}
          <ReferenceLine y={0} stroke="#fff7" />
          <Line type="monotone" dataKey="newNetBalance" stroke="#8884d8"  />
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
              value={formatFixed2(profile.allTimeNetLow)
                    + t("game.currencyShortname")}/>

            <InfoSlot label={t("profile.allTimeHigh")}
              value={formatFixed2(profile.allTimeNetHigh)
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
  const authedUser = useKState(s => s.user);
  const profile = useProfile(props.user);
  const dispatch = useDispatch();
  const ctx = useContext(ModalContext);

  const [joined, setJoined] = useState<string>();

  const [friendTooltip, setFriendTooltip] = useState<HTMLElement>();
  const handleFriend = async () => {
    const isFriend = authedUser.friends.includes(props.user);
    getConnection().updateFriend(
      props.user, !isFriend,
    );

    if (isFriend) {
      dispatch(removeFriend(props.user));
    } else {
      dispatch(addFriends([props.user]));
    }
  };

  const [tipTooltip, setTipTooltip] = useState<HTMLElement>();

  return (
    <Modal className="player-modal">
      <Modal.Header close rightContent={
        joined ? <span className="detail">{t("profile.joined", { joined })}</span> : undefined
      }>
        <Trans i18nKey="profile.profileHeader">
          User Profile: <strong>{{ user: props.user }}</strong>
        </Trans>
        { authedUser.name !== null && authedUser.name !== props.user
          && <>
            <span ref={r => setFriendTooltip(r!)}
                onClick={handleFriend}
                style={{ marginLeft: "12px", cursor: "pointer" }}>
              { authedUser.friends.includes(props.user)
                ? <UserDeleteOutlined />
                : <UserAddOutlined />
              }
            </span>
            <span>
              <GiftOutlined ref={r => setTipTooltip(r!)}
                onClick={() => ctx?.show(<TipModal user={props.user}/>)}
                style={{ marginLeft: "12px", cursor: "pointer" }} />
            </span>

            <Tooltip
              refEl={friendTooltip as HTMLSpanElement}
              config={{ placement: "right" }}
            >{authedUser.friends.includes(props.user)
              ? t("profile.unfriend")
              : t("profile.friend")
            }</Tooltip>

            <Tooltip
              refEl={tipTooltip as HTMLSpanElement}
              config={{ placement: "right" }}
            >{t("profile.tip")}</Tooltip>
          </>
        }
      </Modal.Header>
      <Modal.Content>
        <ErrorBoundary fallback={<h3>{t("profile.failedFetch")}</h3>}>
          <PlayerModalContent user={props.user} readProfile={profile} setJoined={setJoined}/>
        </ErrorBoundary>
      </Modal.Content>
    </Modal>
  );
};

export const TipModal: (props: {
  user: string
}) => ModalElement = ({ user }) => {
  const [t] = useTranslation();

  const authedUser = useKState(s => s.user);

  const [value, setValue] = useState(100);
  const [error, setError] = useState<string>();

  const ctx = useContext(ModalContext);

  const [loading, setLoading] = useState(false);
  const performTip = async () => {
    setLoading(true);
    try {
      await getConnection().sendTip(user, value);
      TipToStream.next({ to: user, amount: value });
      ctx?.close();
    } catch (e) {
      if (isRequestError(e)) {
        if (e.error === ErrorDetail.NOT_EXISTS) setError(t("errors.user404"));
        else if (e.error === ErrorDetail.LOW_BALANCE) setError(t("errors.lowBalance"));
        else {
          setError(t("errors.unknown"));
          console.error(e);
        }
      } else {
        setError(t("errors.unknown"));
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  const afterBalance = (authedUser.bal ?? 0) - value;

  return (
    <Modal className="tip-modal">
      <Modal.Header close>
        <Trans i18nKey="profile.tipModal.title">
          Tip <strong>{{ user }}</strong>
        </Trans>
      </Modal.Header>
      <Modal.Content>
        <Flexor align="center" className="mb-4">
          <span>{t("profile.tipModal.yourBalance")}</span>
          <Spacer/>
          <span className="fs-2" style={{ marginRight: "26px" }}>
            {formatFixed2(authedUser.bal ?? 0)}<strong>{t("game.currencyShortname")}</strong>
          </span>
        </Flexor>
        <Flexor align="center" className="mb-4">
          <span className="form-prelabel">{t("profile.tipModal.label")}</span>
          <Spacer>
            <KInput className="nomargin" noFill error={error} onFinish={performTip}
              suffix={t("game.currencyShortname")}
              suffixTooltip={t("game.currency")}
              initialValue={value/100}
              onChange={v => setValue(Math.round(100*+v) || 0)}
              reformatter={v => (+v ? +v : 1).toFixed(2)}
            />
          </Spacer>
        </Flexor>
        <Flexor align="center" className="mb-4">
          <span>{t("profile.tipModal.newBalance")}</span>
          <Spacer/>
          <span className={clazz("fs-2", afterBalance < 0 && "error-fg")}
                style={{ marginRight: "26px" }}
          >
            {formatFixed2(afterBalance)}<strong>{t("game.currencyShortname")}</strong>
          </span>
        </Flexor>
        <Flexor>
          <Spacer/>
          <KButton
            className="nomargin"
            disabled={loading || value === 0 || afterBalance < 0}
            onClick={performTip}
          >
            {t("profile.tipModal.action")}
          </KButton>
        </Flexor>
      </Modal.Content>
    </Modal>
  );
};

export const DepositStream = new Subject<{ amount: number }>();

export const BalanceModal: () => ModalElement = () => {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const authedUser = useKState(s => s.user);

  const [value, setValue] = useState(1);
  const [address, setAddress] = useState("");

  const [error, setError] = useState<string>();
  const [addyError, setAddyError] = useState<string>();

  const ctx = useContext(ModalContext);

  const checkAddress = (hard: boolean, addy: string) => {
    if (/^(k[a-z0-9]{9}|[a-zA-Z0-9]+@[a-z0-9]{1,64}.kst)$/.test(addy)) {
      setAddyError(undefined);
      return false;
    }

    if (hard) {
      setAddyError(t("errors.invalidAddress"));
    }

    return true;
  };

  const [loading, setLoading] = useState(false);
  const performWithdrawal = async () => {
    if (checkAddress(true, address)) return;

    setLoading(true);
    try {
      const { newBal } = await getConnection().withdrawKrist(address, value);
      dispatch(updateBalance(newBal));
      DepositStream.next({ amount: value });

      ctx?.close();
    } catch (e) {
      if (isRequestError(e)) {
        if (e.error === ErrorDetail.LOW_BALANCE) setError(t("errors.lowBalance"));
        else if (e.error === ErrorDetail.NOT_EXISTS) setAddyError(t("errors.invalidAddress"));
        else {
          setError(t("errors.unknown"));
          console.error(e);
        }
      } else {
        setError(t("errors.unknown"));
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  const afterBalance = (authedUser.bal ?? 0) - 100*value;

  return (
    <Modal className="balance-modal">
      <Modal.Header close>
        {t("profile.balanceModal.title")}
      </Modal.Header>
      <Modal.Content>
        <h2 className="mt-0">{t("profile.balanceModal.depositHeader")}</h2>
        <p>{t("profile.balanceModal.sendTo")}</p>
        <h3 className="t-center"><strong>{authedUser.name}@bust.kst</strong></h3>
        <h2 className="mt-5">{t("profile.balanceModal.withdrawHeader")}</h2>
        <Flexor align="center" className="mb-4">
          <span>{t("profile.balanceModal.yourBalance")}</span>
          <Spacer/>
          <span className="fs-2" style={{ marginRight: "26px" }}>
            {formatFixed2(authedUser.bal ?? 0)}<strong>{t("game.currencyShortname")}</strong>
          </span>
        </Flexor>
        <Flexor align="center" className="mb-4">
          <span className="form-prelabel">{t("profile.balanceModal.label")}</span>
          <Spacer>
            <KInput className="nomargin" noFill error={error} onFinish={performWithdrawal}
              suffix={t("game.currencyShortname")}
              suffixTooltip={t("game.currency")}
              initialValue={value}
              onChange={v => setValue(Math.round(+v) || 0)}
              reformatter={v => (+v ? +v : 1).toFixed()}
            />
          </Spacer>
        </Flexor>
        <Flexor align="center" className="mb-4">
          <span>{t("profile.balanceModal.newBalance")}</span>
          <Spacer/>
          <span className={clazz("fs-2", afterBalance < 0 && "error-fg")}
                style={{ marginRight: "26px" }}
          >
            {formatFixed2(afterBalance)}<strong>{t("game.currencyShortname")}</strong>
          </span>
        </Flexor>
        <Flexor align="center" className="mb-4">
          <span className="form-prelabel">{t("profile.balanceModal.withdrawTo")}</span>
          <Spacer>
            <KInput className="nomargin" noFill error={addyError} onFinish={performWithdrawal}
              initialValue={address} onChange={v => (setAddress(v), checkAddress(false, v))}
              onBlur={(v) => checkAddress(true, v)}
            />
          </Spacer>
        </Flexor>
        <Flexor>
          <Spacer/>
          <KButton
            className="nomargin"
            disabled={loading || value === 0 || !address || afterBalance < 0 || !!addyError}
            onClick={performWithdrawal}
          >
            {t("profile.balanceModal.action")}
          </KButton>
        </Flexor>
      </Modal.Content>
    </Modal>
  );
};

export const AddFriendModal: () => ModalElement = () => {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();

  const ctx = useContext(ModalContext);

  const [loading, setLoading] = useState(false);
  const addFriend = async () => {
    setLoading(true);

    try {
      await getConnection().updateFriend(value, true);
      dispatch(addFriends([value]));
      ctx?.close();
    } catch (e) {
      if (isRequestError(e)) {
        if (e.error === ErrorDetail.NOT_EXISTS) setError(t("errors.user404"));
        else if (e.error === ErrorDetail.NOOP)  setError(t("errors.friendNoop"));
        else {
          setError(t("errors.unknown"));
          console.error(e);
        }
      } else {
        setError(t("errors.unknown"));
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal className="add-friend-modal">
      <Modal.Header close>
        {t("profile.addFriend.title")}
      </Modal.Header>
      <Modal.Content>
        <Flexor align="center" className="mb-4">
          <span className="form-prelabel">{t("profile.addFriend.label")}</span>
          <Spacer>
            <KInput className="nomargin" noFill error={error}
              onChange={setValue} value={value} onFinish={addFriend}
            />
          </Spacer>
        </Flexor>
        <Flexor>
          <Spacer/>
          <KButton
            className="nomargin"
            disabled={loading || value.trim() === ""}
            onClick={addFriend}
          >
            {t("profile.addFriend.action")}
          </KButton>
        </Flexor>
      </Modal.Content>
    </Modal>
  );
};
