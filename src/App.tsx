import React, { Suspense } from "react";
import { createStore, Store } from "redux";
import { Provider } from "react-redux";
import "./App.scss";
import Blobs from "./components/aesthetic/blobs";
import { Spinner } from "./components/aesthetic/spinner";
import { KBitLayout, KHeader } from "./layout/kbit";
import RootReducer, { RootState } from "./store/reducers/RootReducer";
import { devToolsEnhancer } from "redux-devtools-extension";
import { createConnection } from "./meta/connection";

export const store: Store<RootState> = createStore(
    RootReducer,
    devToolsEnhancer({}),
);

export type AppDispatch = typeof store.dispatch;


// Server websocket connection
createConnection("localhost:8080");

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <Blobs/>
        <Suspense fallback={<Spinner/>}>
          <KHeader/>
          <KBitLayout/>
        </Suspense>
      </Provider>
    </div>
  );
}

export default App;
