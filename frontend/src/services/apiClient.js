const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'sanjeevani_token';

let authErrorCallbacks = [];

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function onAuthError(callback) {
  authErrorCallbacks.push(callback);
  return () => {
    authErrorCallbacks = authErrorCallbacks.filter((cb) => cb !== callback);
  };
}

function triggerAuthError(message) {
  removeStoredToken();
  authErrorCallbacks.forEach((cb) => cb(message));
}

/**
 * Central API fetch wrapper for Sanjeevani platform.
 * Automatically attaches Authorization: Bearer <token> if stored.
 * Intercepts 401 responses to trigger global logout / re-authentication.
 */
export async function apiFetch(endpoint, options = {}) {
  const token = options.token || getStoredToken();
  const headers = { ...options.headers };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set default JSON Content-Type if body is not FormData
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    let data;
    try {
      data = await res.json();
    } catch (err) {
      data = { success: false, message: `Server returned non-JSON response (${res.status})` };
    }

    if (res.status === 401) {
      const errMsg = data.message || 'Session expired or unauthorized. Please authenticate again.';
      triggerAuthError(errMsg);
      return { success: false, status: 401, message: errMsg, data };
    }

    return {
      success: res.ok && (data.success !== false),
      status: res.status,
      ...data,
    };
  } catch (err) {
    console.error(`API Request Error [${endpoint}]:`, err);
    return {
      success: false,
      status: 0,
      message: err.message || 'Network error. Please check your connection.',
    };
  }
}
