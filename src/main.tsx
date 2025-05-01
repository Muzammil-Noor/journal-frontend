"use client"

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Main App component
import "./index.css"; // Global styles
import { Provider } from "react-redux";
import store from "./store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
