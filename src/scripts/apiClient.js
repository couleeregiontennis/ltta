// API client - replaces supabaseClient.js
// All database and auth operations go through the local Express backend

const API_BASE = '/api';

async function request(path, options = {}) {
  const { method = 'GET', body, headers = {} } = options;

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // send httpOnly cookies
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    const error = new Error(errorData.error || `Request failed: ${response.status}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  // Handle 204 No Content
  if (response.status === 204) return null;

  return response.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

// Auth-specific helpers that mirror the old Supabase auth API shape
export const auth = {
  getSession: () => api.get('/auth/session'),
  signInWithPassword: ({ email, password }) => api.post('/auth/login', { email, password }),
  signUp: ({ email, password }) => api.post('/auth/signup', { email, password }),
  signOut: () => api.post('/auth/logout'),
  resetPasswordForEmail: (email) => api.post('/auth/reset-password', { email }),
  updateUser: ({ password }) => api.put('/auth/update-password', { password }),
};

export default api;
