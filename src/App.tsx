import React, { Suspense, useEffect, useState } from "react";
import { createStore, Store } from "redux";
import { Provider } from "react-redux";
import Blobs from "./components/aesthetic/blobs";
import { Spinner } from "./components/aesthetic/spinner";
import { Card, KBitLayout, KHeader } from "./layout/kbit";
import RootReducer, { RootState } from "./store/reducers/RootReducer";
import { devToolsEnhancer } from "redux-devtools-extension";
import { Banned, createConnection } from "./meta/connection";
import { ChatView } from "./layout/chat";
import { GameAudio, GameMusic } from "./audio/GameAudio";
import { ModalProvider } from "./components/modal";
import { TipOverlay } from "./components/aesthetic/tips";
import { NotifyPopup } from "./components/notifyPopup";
import { useTranslation } from "react-i18next";

export const store: Store<RootState> = createStore(
    RootReducer,
    devToolsEnhancer({}),
);

export type AppDispatch = typeof store.dispatch;


// Server websocket connection
createConnection(process.env.NODE_ENV === "development"
  ? "localhost:8081" : window.location.host);

function App() {
  const [chatOnly, setChatOnly] = useState(false);

  const [banned, acknowledgeBan] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("banned") === "true") {
      acknowledgeBan(true);
    }

    return Banned.subscribe(() => acknowledgeBan(true));
  }, []);

  return (
    <div className="App">
      <Provider store={store}>
        {!banned && <Blobs count={15}/>}
        <Suspense fallback={<Spinner/>}>
          {banned ?
            <BannedMessage />
          : <>
            <ModalProvider>
              {chatOnly
              ? <Card>
                <ChatView />
              </Card>
              : <>
                <KHeader onChatOnly={() => setChatOnly(true)}/>
                <KBitLayout/>
              </>}
            </ModalProvider>
            <TipOverlay/>
            <GameAudio/>
            <GameMusic/>
            <NotifyPopup/>
          </>}
        </Suspense>
      </Provider>
    </div>
  );
}

function BannedMessage() {
  const [t] = useTranslation();
  return <div className="banned">{t("banned")}</div>;
}

export default App;
