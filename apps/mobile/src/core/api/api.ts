import { create } from 'axios';
import { Platform } from 'react-native';

// Android emulator uses 10.0.2.2 to reach host machine, iOS simulator uses localhost
const DEV_API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

const API_URL = process.env.EXPO_PUBLIC_API_URL || DEV_API_URL;

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
