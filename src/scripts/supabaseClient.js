import { createClient } from '@supabase/supabase-js';

// Patch navigator.locks to prevent Supabase Auth from hanging indefinitely
if (typeof navigator !== 'undefined' && navigator.locks && navigator.locks.request) {
  try {
    const originalRequest = navigator.locks.request.bind(navigator.locks);
    navigator.locks.request = async (name, options, callback) => {
      const cb = typeof options === 'function' ? options : callback;
      return Promise.race([
        originalRequest(name, options, callback),
        new Promise((resolve, reject) => {
          setTimeout(() => {
            console.warn('[locks-patch] Lock request timed out, bypassing to prevent hang:', name);
            if (cb) {
              try {
                const res = cb();
                if (res && typeof res.then === 'function') {
                  res.then(resolve, reject);
                } else {
                  resolve(res);
                }
              } catch (e) {
                reject(e);
              }
            } else {
              resolve();
            }
          }, 1000);
        })
      ]);
    };
  } catch (e) {
    console.error('Failed to patch navigator.locks:', e);
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
