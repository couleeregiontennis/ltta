import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Initialize window._env_ from import.meta.env for consistency, especially in E2E environments
if (typeof window !== 'undefined') {
  window._env_ = window._env_ || {};
  Object.keys(import.meta.env).forEach(key => {
    if (window._env_[key] === undefined) {
      window._env_[key] = import.meta.env[key];
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(App)
);
