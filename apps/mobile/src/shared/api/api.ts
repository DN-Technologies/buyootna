import { create } from 'axios';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { getOrCreateDeviceId } from '@/shared/utils/deviceId';

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

// Resolved once at module init. Read is async (SecureStore), so the very
// first request or two fired before this resolves goes out without the
// header — acceptable, since login endpoints aren't typically the first
// call made on cold boot.
let _deviceId: string | null = null;
getOrCreateDeviceId()
  .then((id) => {
    _deviceId = id;
  })
  .catch(() => undefined);

// --- Request Interceptor ---
apiClient.interceptors.request.use(
  async (config) => {
    if (_authToken && config.headers) {
      config.headers.Authorization = `Bearer ${_authToken}`;
    }
    if (config.headers) {
      config.headers['X-Device-Platform'] = Platform.OS;
      if (_deviceId) {
        config.headers['X-Device-Id'] = _deviceId;
      }
      if (Device.modelName) {
        config.headers['X-Device-Model'] = Device.modelName;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// A cold app launch can fire its very first network request before the
// OS's WiFi/DNS stack has fully warmed up -- axios reports this as a
// network error with no `response` at all, distinct from a real 4xx/5xx
// the server actually sent back (which must never be silently retried).
// A couple of quick automatic retries turns that into an invisible blip
// instead of a user-facing "connection error" that only a manual retry
// actually fixes (observed live: retrying always succeeded immediately).
const MAX_NETWORK_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Response Interceptor ---
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only trigger a logout if a token was actually present — prevents a
    // phantom logout loop when a call is made before the user is signed in.
    if (error.response && error.response.status === 401 && _authToken) {
      _onUnauthorized?.();
    }

    const config = error.config as
      | (typeof error.config & { __retryCount?: number })
      | undefined;
    if (!error.response && config) {
      const retryCount = (config.__retryCount ?? 0) + 1;
      if (retryCount <= MAX_NETWORK_RETRIES) {
        config.__retryCount = retryCount;
        await wait(RETRY_DELAY_MS * retryCount);
        return apiClient(config);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
