import React, { Suspense, useState } from "react";
import { createStore, Store } from "redux";
import { Provider } from "react-redux";
import "./App.scss";
import Blobs from "./components/aesthetic/blobs";
import { Spinner } from "./components/aesthetic/spinner";
import { Card, KBitLayout, KHeader } from "./layout/kbit";
import RootReducer, { RootState } from "./store/reducers/RootReducer";
import { devToolsEnhancer } from "redux-devtools-extension";
import { createConnection } from "./meta/connection";
import { ChatView } from "./layout/chat";
import { GameAudio, GameMusic } from "./audio/GameAudio";

export const store: Store<RootState> = createStore(
    RootReducer,
    devToolsEnhancer({}),
);

export type AppDispatch = typeof store.dispatch;


// Server websocket connection
createConnection("bust.loca.lt");

function App() {
  const [chatOnly, setChatOnly] = useState(false);

  return (
    <div className="App">
      <Provider store={store}>
        <Blobs count={15}/>
        <Suspense fallback={<Spinner/>}>
          {chatOnly
          ? <Card>
            <ChatView />
          </Card>
          : <>
            <KHeader onChatOnly={() => setChatOnly(true)}/>
            <KBitLayout/>
          </>}
          <GameAudio/>
          <GameMusic/>
        </Suspense>
      </Provider>
    </div>
  );
}

export default App;
