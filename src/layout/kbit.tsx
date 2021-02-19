import { CSSProperties, FC, MutableRefObject, useRef, useState } from "react";
import { BustChart } from "../components/chart";
import "./kbit.scss";
import { clazz } from "../util/class";
import { useTranslation } from "react-i18next";
import { BetUI } from "./betui";
import { AuthUI } from "./auth";
import { ShortHistory } from "../components/history";
import { Spacer } from "./flex";
import { useKState } from "../util/types";
import { ComboView } from "./combo";
import { PlayerList } from "./players";
import { ChatView } from "./chat";
import useBreakpoint from "use-breakpoint";
import { LogoutOutlined } from "@ant-design/icons";
import { Tooltip } from "../components/pop";
import { useDispatch } from "react-redux";
import { logoutUser } from "../store/actions/UserActions";
import { getConnection } from "../meta/connection";

const Card: FC<{
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

export function KHeader() {
  const [t] = useTranslation();
  const [logout, setLogout] = useState<HTMLSpanElement | null>();
  const user = useKState(s => s.user);
  const dispatch = useDispatch();

  const onLogout = () => {
    localStorage.removeItem("reauth");
    dispatch(logoutUser());
    getConnection().logout();
  };

  const profile = user.name ?
    <>
      <span className="header-info">{user.name}</span>
      <span className="header-info">{
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
    </> : null;

  return (
    <div className="kbit-header">
      <img src="/krist.webp"/>
      <h1>BustAKrist</h1>
      <Spacer/>
      {profile}
    </div>
  );
}

const BREAKPOINTS = { mobile: 0, desktop: 1101 };

export function KBitLayout() {
  const [t] = useTranslation();

  const breakpt = useBreakpoint(BREAKPOINTS, "desktop");

  const username = useKState(s => s.user.name);
  console.log("uname", username);

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
            : <BetUI />
        }
      </Card>
      <Card id="players" area="play">
        <PlayerList />
      </Card>
      <Card area="multi">
        <ComboView>
          <ComboView.Tab label={t("chat.tab")}>
            <ChatView />
          </ComboView.Tab>
          <ComboView.Tab label={t("history.tab")}>B</ComboView.Tab>
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
