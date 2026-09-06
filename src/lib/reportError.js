const ENDPOINT = '/api/client-errors';

function requestId() {
  // Best effort: the server stamps this on responses; keep the last one seen.
  return window.__dshRequestId || null;
}

export function installRequestIdCapture() {
  const origFetch = window.fetch;
  window.fetch = async (...args) => {
    const res = await origFetch(...args);
    try {
      const id = res.headers.get('x-request-id');
      if (id) window.__dshRequestId = id;
    } catch { /* ignore */ }
    return res;
  };
}

export function reportError({ message, stack, extra = {} }) {
  try {
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        stack,
        url: window.location.href,
        requestId: requestId(),
        ...extra,
      }),
      keepalive: true,
    }).catch(() => { /* best-effort only */ });
  } catch { /* never disrupt the UI */ }
}
