import { FC, MutableRefObject, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChatMessage } from "../store/reducers/ChatReducer";
import { useKState } from "../util/types";
import { SendOutlined, GlobalOutlined } from "@ant-design/icons";
import { getConnection } from "../meta/connection";
import { Divider } from "./misc";
import "./chat.scss";
import { HSVColor } from "../util/color";
import { clazz } from "../util/class";

export const Message: FC<{
  msg: ChatMessage
}> = (props) => {
  return (
    <div className="chat-message">
      <span className="msg-time">{props.msg.timestamp.toLocaleTimeString()}</span>
      <span className="msg-author">{props.msg.from}</span>:&nbsp;
      <span className="msg-content">{props.msg.message}</span>
    </div>
  );
};

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
  return color.asRGB().toString() + "88";
}


export function ChatView() {
  const GLOBAL_FEED_BRAND = useMemo(() => ({}), []);

  const [t] = useTranslation();
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

  return (
    <div className="chat-view">
      <div className="chat-history" ref={containerRef}>
        <div className="chat-hwrap">
          { feed.map((msg, idx) =>
            <Message key={+msg.timestamp + "-" + msg.from + idx} msg={msg} />,
          )}
          { selectedFeed !== GLOBAL_FEED_BRAND && feed.length === 0 &&
            <div className="chat-hint">
              You have no message history with <strong>{
                selectedFeed.toString()}</strong>, say Hello!
            </div>
          }
        </div>
        <div className="chat-feeds">
          <GlobalOutlined
            className={clazz("feed", selectedFeed === GLOBAL_FEED_BRAND && "active")}
            onClick={() => selectFeed(GLOBAL_FEED_BRAND)}
          />
          { allFeeds.length ? <Divider margin={8} /> : null }
          <div className="friend-feeds">
            { allFeeds.map((friend, idx) =>
              <div
                key={idx}
                className={clazz("feed friend-feed", selectedFeed === friend && "active")}
                style={{ backgroundColor: getColor(friend) }}
                onClick={() => selectFeed(friend)}
              >{friend[0]}</div>,
            )}
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
