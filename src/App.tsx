import React, { Suspense } from "react";
import { createStore } from "redux";
import { Provider } from "react-redux";
import "./App.scss";
import Blobs from "./components/aesthetic/blobs";
import { Spinner } from "./components/aesthetic/spinner";
import { KBitLayout } from "./layout/kbit";
import RootReducer from "./store/reducers/RootReducer";
import { devToolsEnhancer } from "redux-devtools-extension";

export const store = createStore(
    RootReducer,
    devToolsEnhancer({}),
);

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <Blobs/>
        <Suspense fallback={<Spinner/>}>
          <KBitLayout/>
        </Suspense>
      </Provider>
    </div>
  );
}

export default App;
