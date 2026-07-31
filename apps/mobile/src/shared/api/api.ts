import { create } from 'axios';
import { Platform } from 'react-native';

export function validateApiUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url) {
    if (__DEV__) {
      return Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
    }
    throw new Error(
      'EXPO_PUBLIC_API_URL is not defined in the environment variables. Please set it in your .env file.',
    );
  }
  if (__DEV__ && Platform.OS === 'android' && (url.includes('localhost') || url.includes('127.0.0.1'))) {
    return url.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
  }
  return url;
}

const API_URL = validateApiUrl();

const apiClient = create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Token injection — avoids a circular import between api.ts ↔ useAuthStore.ts
// The auth store calls `setAuthToken` / `clearAuthToken` to keep this in sync.
// ---------------------------------------------------------------------------
let _authToken: string | null = null;
let _onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  _authToken = token;
}

export function setOnUnauthorized(cb: () => void) {
  _onUnauthorized = cb;
}

// --- Request Interceptor ---
apiClient.interceptors.request.use(
  async (config) => {
    if (_authToken && config.headers) {
      config.headers.Authorization = `Bearer ${_authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// --- Response Interceptor ---
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only trigger a logout if a token was actually present — prevents a
    // phantom logout loop when a call is made before the user is signed in.
    if (error.response && error.response.status === 401 && _authToken) {
      _onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
