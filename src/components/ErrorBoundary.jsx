import React from 'react';
import { reportError } from '../lib/reportError';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    reportError({
      message: error.message,
      stack: [error.stack, info.componentStack].filter(Boolean).join('\n'),
      extra: { type: 'ReactRenderError' },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>The error has been reported. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      );
    }
    return this.props.children;
  }
}
