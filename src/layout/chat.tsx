import { createRef, FC, forwardRef, MutableRefObject,
  useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { ChatMessage } from "../store/reducers/ChatReducer";
import { useKState } from "../util/types";
import { SendOutlined, GlobalOutlined, UserAddOutlined } from "@ant-design/icons";
import { getConnection } from "../meta/connection";
import { Divider } from "./misc";
import "./chat.scss";
import { HSVColor } from "../util/color";
import { clazz } from "../util/class";
import { Tooltip } from "../components/pop";
import { ModalContext } from "../components/modal";
import { PlayerModal, AddFriendModal } from "./modal/PlayerModal";
import { playSound } from "../audio/AudioManager";
import { canNotify } from "../util/notify";
import { useDispatch } from "react-redux";
import { readMessages } from "../store/actions/ChatActions";

export const Message: FC<{
  msg: ChatMessage
}> = (props) => {
  const modalCtx = useContext(ModalContext);

  const isReal = props.msg.from !== "<SYSTEM>";
  const openAuthor = () => {
    if (isReal) {
      modalCtx?.show(<PlayerModal user={props.msg.from}/>);
    }
  };

  return (
    <div className="chat-message">
      <span className="msg-time">{props.msg.timestamp.toLocaleTimeString()}</span>
      <span className={clazz("msg-author", !isReal && "unclickable")} onClick={openAuthor}
      >{props.msg.from}</span>:&nbsp;
      <span className="msg-content">{props.msg.message}</span>
    </div>
  );
};

export const FriendFeedIcon = forwardRef<HTMLDivElement, {
  friend: string
  active: boolean
  onClick:(friend: string) => void
}>(
  ({ friend, active, onClick }, ref) => {
    const dispatch = useDispatch();
    const chat = useKState(s => s.chat);
    const feed = chat.dms[friend] ?? [];

    const unreads = feed.filter(m => chat.unread.has(m.id));
    useEffect(() => {
      if (unreads.length && active) return void dispatch(readMessages(unreads.map(m => m.id)));
    }, [unreads.length, active]);

    return (
      <div
        className={clazz("feed friend-feed", active && "active")}
        style={{ backgroundColor: getColor(friend) }}
        onClick={() => onClick(friend)}
        ref={ref as any}
      >
        {friend[0]}
        {unreads.length > 0 && <div className="unread-badge">{unreads.length}</div>}
      </div>
    );
  },
);

FriendFeedIcon.displayName = "FriendFeedIcon";


function hashCode(str: string): number {
  let hash = 0;
  if (str.length == 0) {
    return hash;
  }

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return hash;
}

function getColor(name: string): string {
  const code = hashCode(name);
  const color = new HSVColor((code/1000) % 1, 0.8, 0.6);
  return color.asRGB().toString();
}


export function ChatView() {
  const GLOBAL_FEED_BRAND = useMemo(() => ({}), []);

  const modalCtx = useContext(ModalContext);

  const [t] = useTranslation();
  const dispatch = useDispatch();
  const user = useKState(s => s.user);
  const messageStore = useKState(s => s.chat);
  const [selectedFeed, selectFeed] = useState<typeof GLOBAL_FEED_BRAND | string>(GLOBAL_FEED_BRAND);
  const feed = (selectedFeed === GLOBAL_FEED_BRAND
    ? messageStore.chat
    : messageStore.dms[selectedFeed as string]) ?? [];

  if (typeof selectedFeed === "object" && selectedFeed !== GLOBAL_FEED_BRAND) {
    selectFeed(GLOBAL_FEED_BRAND);
  }

  const allFeeds = Array.from(new Set(Object.keys(messageStore.dms).concat(user.friends)));

  const containerRef = useRef() as MutableRefObject<HTMLDivElement>;
  if (containerRef.current) {
    const el = containerRef.current;
    if (el.scrollTop === 1) {
      el.scrollTop = 0;
    }
  }

  const [currText, setText] = useState<string>("");
  const sendMessage = () => {
    const filtered = currText.trim();

    if (filtered.length) {
      getConnection().sendMessage(
          filtered, selectedFeed === GLOBAL_FEED_BRAND ? undefined : selectedFeed as string,
      );

      setText("");
    }
  };

  const checkKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  if (!user.name && currText.length) {
    setText("");
  }

  const arrLength = allFeeds.length;
  const elRefs = useRef([]);

  if (elRefs.current.length !== arrLength) {
    // add or remove refs
    elRefs.current = Array(arrLength).fill(null).map((_, i) => elRefs.current[i] || createRef());
  }

  if (selectedFeed !== GLOBAL_FEED_BRAND && !allFeeds.includes(selectedFeed.toString())) {
    selectFeed(GLOBAL_FEED_BRAND);
  }

  // Effectively clear unread when feed is active
  const globalActive = selectedFeed === GLOBAL_FEED_BRAND;
  const globalUnreads = messageStore.chat.filter(m => messageStore.unread.has(m.id));
  useEffect(() => {
    if (globalUnreads.length && globalActive) {
      return void dispatch(readMessages(globalUnreads.map(m => m.id)));
    }
  }, [globalUnreads.length, globalActive]);


  return (
    <div className="chat-view">
      <div className="chat-upper">
        <div className="chat-history scroller" ref={containerRef}>
          <div className="chat-hwrap">
            { feed.map((msg, idx) =>
              <Message key={+msg.timestamp + "-" + msg.from + idx} msg={msg} />,
            )}
            { selectedFeed !== GLOBAL_FEED_BRAND && feed.length === 0 &&
              <div className="chat-hint">
                <Trans i18nKey="chat.noHistoryHint">
                  You have no message history with <strong
                    style={{ cursor: "pointer" }}
                    onClick={() => modalCtx?.show(<PlayerModal user={selectedFeed.toString()}/>)}
                  >{{
                    name: selectedFeed.toString(),
                  }}</strong>, say Hello!
                </Trans>
              </div>
            }
          </div>
        </div>
        <div className="chat-feeds-container no-scroller">
          <div className="chat-feeds">
            <GlobalOutlined
              className={clazz("feed", selectedFeed === GLOBAL_FEED_BRAND && "active")}
              onClick={() => selectFeed(GLOBAL_FEED_BRAND)}
            />
            {!globalActive && globalUnreads.length > 0
              && <div className="unread-badge subtle">{globalUnreads.length}</div>}

            { user.name ? <Divider margin={8} /> : null }
            <div className="friend-feeds">
              { allFeeds.map((friend, idx) =>
                <FriendFeedIcon key={idx}
                  ref={elRefs.current[idx]}
                  friend={friend}
                  active={selectedFeed === friend}
                  onClick={selectFeed}
                />,
              )}
            </div>
            { user.name && <UserAddOutlined onClick={() => modalCtx?.show(<AddFriendModal/>)} />}
          </div>
          <div>
            { elRefs.current.map((ref: any, idx) => {
              const friend = allFeeds[idx];

              return ref.current && <Tooltip key={friend + "-" + idx}
                refEl={ref.current as HTMLElement}
                config={{ placement: "right" }}
              >
                {friend}
              </Tooltip>;
            })}
          </div>
        </div>
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder={user.name ? t("chat.inputPlaceholder") : t("chat.loginPlaceholder")}
          disabled={!user.name}
          value={currText}
          onChange={e => setText(e.target.value)}
          onKeyDown={checkKeys}
          maxLength={200}
        />
        <SendOutlined
          disabled={!user.name}
          onClick={sendMessage}
          className="send"
          style={{ fontSize: "18px" }}
        />
      </div>
    </div>
  );
}
