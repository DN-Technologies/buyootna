import { create } from 'axios';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Updates from 'expo-updates';
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

// A profile switch shows the new profile at once, before the API has
// returned its token. Meanwhile every request waits here, then goes out
// with the new token -- never the old profile's (that would load its data
// into the new profile's screens). The switch request itself is exempt.
declare module 'axios' {
  interface AxiosRequestConfig {
    skipTokenHold?: boolean;
  }
}
let _tokenHold: Promise<void> | null = null;

/** Holds requests until the returned release is called (once the new token is set). */
export function holdRequestsForNewToken(): () => void {
  let release!: () => void;
  const hold = new Promise<void>((resolve) => {
    release = resolve;
  });
  _tokenHold = hold;
  return () => {
    if (_tokenHold === hold) _tokenHold = null;
    release();
  };
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

// Which build this is, sent on every request so the testing portal can show
// the builds in use: the app version, its runtime, and the OTA update it
// runs ("embedded" before any OTA). Read once; never fails a request.
function readBuildHeaders(): Record<string, string> {
  try {
    const headers: Record<string, string> = {};
    const version = Constants.expoConfig?.version;
    if (version) headers['X-App-Version'] = version;
    if (Updates.runtimeVersion) headers['X-App-Runtime'] = Updates.runtimeVersion;
    headers['X-App-Update'] =
      !Updates.isEmbeddedLaunch && Updates.updateId ? Updates.updateId.slice(0, 8) : 'embedded';
    return headers;
  } catch {
    return {};
  }
}
const BUILD_HEADERS = readBuildHeaders();

// --- Request Interceptor ---
apiClient.interceptors.request.use(
  async (config) => {
    if (_tokenHold && !config.skipTokenHold) await _tokenHold;
    if (_authToken && config.headers) {
      config.headers.Authorization = `Bearer ${_authToken}`;
    }
    if (config.headers) {
      config.headers['X-Device-Platform'] = Platform.OS;
      for (const [name, value] of Object.entries(BUILD_HEADERS)) {
        config.headers[name] = value;
      }
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
// actually fixes.
//
// 2 retries at 1s/2s (~3s total) wasn't enough in practice -- confirmed
// live, repeatedly, that the connection error still appeared even with
// that in place, while a *manual* retry tap (done several seconds later,
// after the user reads the error) always eventually succeeded. That gap
// is the tell: the underlying blip outlasts a few seconds. Widened to
// better match how long a real manual retry ends up waiting.
//
// Only reads are retried: a write whose response was lost may already have
// happened on the server, and sending it again published an ad twice (or
// failed it as "package empty" on the last credit). A write fails with the
// usual connection error instead; screens that retry one send their own
// key so the server can tell it's a repeat.
const MAX_NETWORK_RETRIES = 4;
const RETRY_DELAY_MS = 1200;
const RETRYABLE_METHODS = ['get', 'head', 'options'];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sentWithCurrentToken(config: any): boolean {
  if (!config) return true;
  const sent = config.headers?.Authorization ?? config.headers?.get?.('Authorization');
  return sent === `Bearer ${_authToken}`;
}

// --- Response Interceptor ---
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only trigger a logout if a token was actually present — prevents a
    // phantom logout loop when a call is made before the user is signed in.
    //
    // And only when the refused request carried that same token. A screen
    // opened at launch (a tapped push) can send requests before the saved
    // sign-in is loaded; their 401s come back after it is, and used to sign
    // the user out of a perfectly good session. The same goes for a reply
    // to a request sent with the token from before a profile switch.
    if (
      error.response &&
      error.response.status === 401 &&
      _authToken &&
      sentWithCurrentToken(error.config)
    ) {
      _onUnauthorized?.();
    }

    const config = error.config as
      | (typeof error.config & { __retryCount?: number })
      | undefined;
    const method = (config?.method ?? 'get').toLowerCase();
    if (!error.response && config && RETRYABLE_METHODS.includes(method)) {
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
