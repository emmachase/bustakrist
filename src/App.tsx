import React, { Suspense, useState } from "react";
import { createStore, Store } from "redux";
import { Provider } from "react-redux";
import Blobs from "./components/aesthetic/blobs";
import { Spinner } from "./components/aesthetic/spinner";
import { Card, KBitLayout, KHeader } from "./layout/kbit";
import RootReducer, { RootState } from "./store/reducers/RootReducer";
import { devToolsEnhancer } from "redux-devtools-extension";
import { createConnection } from "./meta/connection";
import { ChatView } from "./layout/chat";
import { GameAudio, GameMusic } from "./audio/GameAudio";
import { ModalProvider } from "./components/modal";

export const store: Store<RootState> = createStore(
    RootReducer,
    devToolsEnhancer({}),
);

export type AppDispatch = typeof store.dispatch;


// Server websocket connection
createConnection("localhost:8081");

function App() {
  const [chatOnly, setChatOnly] = useState(false);

  return (
    <div className="App">
      <Provider store={store}>
        <Blobs count={15}/>
        <Suspense fallback={<Spinner/>}>
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
          <GameAudio/>
          <GameMusic/>
        </Suspense>
      </Provider>
    </div>
  );
}

export default App;
