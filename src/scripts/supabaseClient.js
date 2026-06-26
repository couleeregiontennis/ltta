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

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
