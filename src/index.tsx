import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import "./utilities.scss";
import "./i18n";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("root"),
);

// Delay to display message after any initialization messages
setTimeout(() => {
  console.log("%c BustAKrist 💎 \n%c   by @emma",
      "font-size: 3em; background: #9932CC88; color: white; line-height: 2.5em",
      "font-size: 1.5em; color: #ffffff55");

  console.log(
      "%cCareful. This is a browser feature intended for developers. "
    + "If someone told you to copy and paste something here to enable a bustakrist feature "
    + "or do a \"hack\", it is a scam and will give them access to your bustakrist account.",

      "font-size: 2em; background: #ff0000; color: white",
  );
}, 1000);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
