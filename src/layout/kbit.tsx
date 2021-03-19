import { CSSProperties, FC, MutableRefObject, useContext, useRef, useState } from "react";
import { BustChart } from "../components/chart";
import "./kbit.scss";
import { clazz } from "../util/class";
import { useTranslation, Trans } from "react-i18next";
import { BetUI, AutoBetUI } from "./betui";
import { AuthUI } from "./auth";
import { ShortHistory } from "../components/history";
import { Spacer } from "./flex";
import { useKState } from "../util/types";
import { ComboView } from "./combo";
import { PlayerList } from "./players";
import { ChatView } from "./chat";
import useBreakpoint from "use-breakpoint";
import { LogoutOutlined, WechatOutlined } from "@ant-design/icons";
import { Tooltip } from "../components/pop";
import { useDispatch } from "react-redux";
import { logoutUser } from "../store/actions/UserActions";
import { getConnection } from "../meta/connection";
import { LongHistory } from "../components/history";
import { ModalContext, Modal } from "../components/modal";
import { PlayerModal, BalanceModal } from "./modal/PlayerModal";
import { CreditsModal } from "./modal/CreditsModal";
import { KButton } from "../components/form";

export const Card: FC<{
  area?: string,
  row?: number,
  col?: number,
  rowSpread?: number,
  colSpread?: number,
  className?: string,
  id?: string,
  style?: CSSProperties
}> = (props) => {
  return (
    <div id={props.id}
      className={clazz("card", props.className)}
      style={{
        // gridRow: props.row,
        // gridRowEnd: props.row ?? 0 + (props.rowSpread ?? 1),
        // gridColumn: props.col,
        // gridColumnEnd: props.col ?? 0 + (props.colSpread ?? 1),
        gridArea: props.area,
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
};

export const KHeader: FC<{
  onChatOnly: () => void
}> = (props) => {
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [logout, setLogout] = useState<HTMLSpanElement | null>();
  const [balanceTooltip, setBalanceTooltip] = useState<HTMLSpanElement | null>();
  const user = useKState(s => s.user);

  const busted = useKState(s => s.game.bust);
  const pendingStake = useKState(s => s.players.players.find(p => p.name === user.name));
  const hasPendingBalance = pendingStake?.multiplier && !busted;

  const onLogout = () => {
    localStorage.removeItem("reauth");
    dispatch(logoutUser());
    getConnection().logout();
  };

  const modalCtx = useContext(ModalContext);
  const openProfile = () => {
    if (!user.name) return;
    modalCtx?.show(<PlayerModal user={user.name}/>);
  };

  const [forceToolip, setForceTooltip] = useState(true);
  const openBalance = () => {
    if (!user.name) return;
    setForceTooltip(false);
    modalCtx?.show(<BalanceModal />);
  };

  const openCredits = () => {
    modalCtx?.show(<CreditsModal/>);
  };

  const profile = user.name ?
    <>
      <span className="header-info btn" onClick={openProfile}>{user.name}</span>
      <span className={clazz("header-info", "btn", hasPendingBalance && "pending")}
        onClick={openBalance} ref={r => setBalanceTooltip(r)}
      >{
        ((user.bal ?? 0)/100).toFixed(2)}{
        t("game.currencyShortname")}
      </span>
      <span className="header-out" ref={r => setLogout(r)} onClick={onLogout}>
        <LogoutOutlined />
      </span>
      <Tooltip
        refEl={logout as HTMLElement}
        config={{ delayShow: 500, placement: "bottom-end" }}
      >
        {t("auth.logout")}
      </Tooltip>
      { user.bal === 0 && <Tooltip className="attention"
        refEl={balanceTooltip as HTMLElement}
        config={{ visible: forceToolip, placement: "bottom-end" }}
      >
        {t("hint.lowBalance")}
      </Tooltip> }
      { hasPendingBalance && <Tooltip
        refEl={balanceTooltip as HTMLElement}
        config={{ placement: "bottom-end" }}
      >
        {t("hint.pendingBalance")}
      </Tooltip> }
    </> : null;

  return (
    <div className="kbit-header">
      <img src="/krist.webp"/>
      <h1 onClick={openCredits}>BustAKrist</h1>
      {process.env.NODE_ENV === "development" && <span className="dev-badge">dev</span>}

      <Spacer/>
      {profile}
    </div>
  );
};

const BREAKPOINTS = { mobile: 0, desktop: 1101 };

export function KBitLayout() {
  const [t] = useTranslation();

  const breakpt = useBreakpoint(BREAKPOINTS, "desktop");

  const username = useKState(s => s.user.name);

  return (
    <div className="kbit-layout">
      <Card area="graph" style={{
        // paddingLeft: 0,
        // paddingBottom: 25,
      }}>
        <BustChart/>
        <ShortHistory/>
      </Card>
      <Card area="act">
        {
          username === null
            ? <AuthUI/>
            : <ComboView>
                <ComboView.Tab label={t("bet.manual")}>
                  <BetUI />
                </ComboView.Tab>
                <ComboView.Tab label={t("bet.auto")}>
                  <AutoBetUI />
                </ComboView.Tab>
              </ComboView>
        }
      </Card>
      <Card className="players-righttab" area="play">
        <PlayerList />
      </Card>
      <Card area="multi">
        <ComboView>
          <ComboView.Tab label={t("chat.tab")}>
            <ChatView />
          </ComboView.Tab>
          <ComboView.Tab label={t("history.tab")}>
            <LongHistory />
          </ComboView.Tab>
          { breakpt.breakpoint === "mobile" ?
            <ComboView.Tab label={t("players.tab")}>
              <PlayerList />
            </ComboView.Tab> : <></>
          }
        </ComboView>
      </Card>
    </div>
  );
}
