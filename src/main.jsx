import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { logger } from './lib/logger';
import { reportError, installRequestIdCapture } from './lib/reportError';
import ErrorBoundary from './components/ErrorBoundary';

// Initialize window._env_ from import.meta.env for consistency, especially in E2E environments
if (typeof window !== 'undefined') {
  window._env_ = window._env_ || {};
  Object.keys(import.meta.env).forEach(key => {
    if (window._env_[key] === undefined) {
      window._env_[key] = import.meta.env[key];
    }
  });
}

installRequestIdCapture();

window.addEventListener('error', (event) => {
  logger.error('Uncaught error:', event.message);
  reportError({ message: event.message, stack: event.error?.stack || '', extra: { type: 'WindowError' } });
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  logger.error('Unhandled rejection:', reason?.message || String(reason));
  reportError({
    message: reason?.message || String(reason),
    stack: reason?.stack || '',
    extra: { type: 'UnhandledRejection' },
  });
});

ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(ErrorBoundary, null, React.createElement(App))
);
