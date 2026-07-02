import { createClient } from '@supabase/supabase-js';

// Disable navigator.locks to prevent Supabase Auth LockManager from hanging indefinitely in browsers with buggy LockManager implementations
if (typeof navigator !== 'undefined') {
  try {
    Object.defineProperty(navigator, 'locks', {
      get() { return undefined; },
      configurable: true
    });
  } catch (e) {
    console.error('Failed to disable navigator.locks:', e);
  }
}


// Initialize window._env_ if it doesn't exist, to ensure consistency across the app
if (typeof window !== 'undefined') {
    window._env_ = window._env_ || {};
    // Populate with import.meta.env values as a fallback
    Object.keys(import.meta.env).forEach(key => {
        if (!window._env_[key]) {
            window._env_[key] = import.meta.env[key];
        }
    });
}

const supabaseUrl = window._env_?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = window._env_?.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfig = {
    url: supabaseUrl,
    anonKeyPresent: Boolean(supabaseAnonKey),
};

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[supabaseClient] Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY', {
        urlPresent: Boolean(supabaseUrl),
        anonKeyPresent: Boolean(supabaseAnonKey),
    });
}

// -------------------------------------------------
// Global auth-error recovery via custom fetch wrapper
// Intercepts ALL Supabase REST responses. On 401/PGRST301:
//   1. Dispatches ltta:reconnecting event
//   2. Attempts supabase.auth.refreshSession()
//   3. On success: retries the original request with the new token
//   4. On failure: dispatches ltta:auth-failed for AuthProvider to handle
// This is transparent to all 67+ components that call supabase.from().
// -------------------------------------------------

const AUTH_ERROR_CODES = ['PGRST301', 'PGRST302'];

let _isRefreshing = false;
let _refreshPromise = null;

function isAuthErrorResponse(response, body) {
    if (response.status === 401 || response.status === 403) return true;
    if (body && (AUTH_ERROR_CODES.includes(body?.code))) return true;
    if (body?.message && (
        body.message.toLowerCase().includes('jwt') ||
        body.message.toLowerCase().includes('token')
    )) return true;
    return false;
}

const customFetch = async (input, init) => {
    const urlStr = typeof input === 'string' ? input : (input.url || input.toString());

    // Use the native fetch for the initial request
    let response = await fetch(input, init);

    // Skip interception for auth endpoints and when already mid-refresh
    if (_isRefreshing || urlStr.includes('/auth/')) {
        return response;
    }

    // Only intercept 401/403 responses
    if (response.status === 401 || response.status === 403) {
        const cloned = response.clone();
        try {
            const body = await cloned.json();

            if (isAuthErrorResponse(response, body) && window.__ltta_supabase) {
                console.log('[CustomFetch] Auth error detected, attempting session refresh...');

                // Signal reconnecting state globally
                window.dispatchEvent(new CustomEvent('ltta:reconnecting'));

                // Deduplicate concurrent refresh calls
                if (!_refreshPromise) {
                    _refreshPromise = window.__ltta_supabase.auth.refreshSession();
                }

                _isRefreshing = true;
                const { data: refreshData, error: refreshError } = await _refreshPromise;
                _isRefreshing = false;
                _refreshPromise = null;

                console.log('[CustomFetch] Refresh result - error:', refreshError, 'hasSession:', !!refreshData?.session);
                if (refreshData) {
                    console.log('[CustomFetch] refreshData keys:', Object.keys(refreshData));
                }

                if (!refreshError && refreshData?.session) {
                    console.log('[CustomFetch] Session refreshed, retrying request...');
                    console.log('[CustomFetch] New access_token:', refreshData.session.access_token?.substring(0, 15) + '...');

                    // Retry the original request with the new access token
                    const headers = new Headers(init?.headers || {});
                    headers.set('Authorization', `Bearer ${refreshData.session.access_token}`);
                    response = await fetch(input, { ...init, headers });

                    console.log('[CustomFetch] Retry response status:', response.status);
                    // Signal recovery complete
                    window.dispatchEvent(new CustomEvent('ltta:reconnected'));
                    console.log('[CustomFetch] Dispatched ltta:reconnected');
                } else {
                    console.warn('[CustomFetch] Session refresh failed:', refreshError);
                    console.warn('[CustomFetch] refreshData:', refreshData);
                    // Signal auth failure — AuthProvider will handle storage cleanup + reload
                    window.dispatchEvent(new CustomEvent('ltta:auth-failed'));
                    console.warn('[CustomFetch] Dispatched ltta:auth-failed');
                }
            }
        } catch (e) {
            // If body can't be parsed, return the original response as-is
            console.warn('[CustomFetch] Could not parse error response body:', e);
        }
    }

    return response;
};

// Create the Supabase client with the custom fetch wrapper
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { fetch: customFetch }
});

// Store reference for the custom fetch to call refreshSession()
if (typeof window !== 'undefined') {
    window.__ltta_supabase = supabase;
}

export { supabase };
