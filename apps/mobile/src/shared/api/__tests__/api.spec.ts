import * as axios from 'axios';
import { Platform } from 'react-native';

// Imported once: api.ts registers its interceptors at module-load time, and
// validateApiUrl (the function under test in the block below) has no
// module-load-time state of its own, so re-importing per test isn't needed.
import apiClient, {
  holdRequestsForNewToken,
  setAuthToken,
  setOnUnauthorized,
  validateApiUrl,
} from '../api';

jest.mock('axios', () => {
  const mockRequestUse = jest.fn();
  const mockResponseUse = jest.fn();
  // Callable (not just an object) so retry logic can re-invoke the instance
  // as `apiClient(config)`, exactly like the real axios instance does.
  const mockAxiosInstance = Object.assign(jest.fn(), {
    interceptors: {
      request: { use: mockRequestUse },
      response: { use: mockResponseUse },
    },
  });
  const mockCreate = jest.fn(() => mockAxiosInstance);
  return {
    __esModule: true,
    create: mockCreate,
    __mock: { mockRequestUse, mockResponseUse, mockAxiosInstance, mockCreate },
  };
});

const { mockRequestUse, mockResponseUse, mockAxiosInstance, mockCreate } = (
  axios as unknown as {
    __mock: {
      mockRequestUse: jest.Mock;
      mockResponseUse: jest.Mock;
      mockAxiosInstance: jest.Mock;
      mockCreate: jest.Mock;
    };
  }
).__mock;

describe('validateApiUrl', () => {
  const originalEnv = process.env.EXPO_PUBLIC_API_URL;
  const originalDev = (global as any).__DEV__;
  const originalPlatformOS = Platform.OS;

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_URL = originalEnv;
    (global as any).__DEV__ = originalDev;
    (Platform as any).OS = originalPlatformOS;
  });

  it('returns the Android emulator host in dev with no env var set', () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    (global as any).__DEV__ = true;
    (Platform as any).OS = 'android';

    expect(validateApiUrl()).toBe('http://10.0.2.2:8000');
  });

  it('returns the iOS localhost host in dev with no env var set', () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    (global as any).__DEV__ = true;
    (Platform as any).OS = 'ios';

    expect(validateApiUrl()).toBe('http://localhost:8000');
  });

  it('throws in production when no env var is set', () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    (global as any).__DEV__ = false;

    expect(() => validateApiUrl()).toThrow(
      /EXPO_PUBLIC_API_URL is not defined/,
    );
  });

  it('rewrites a localhost env var to the Android emulator host in dev on Android', () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://localhost:3000';
    (global as any).__DEV__ = true;
    (Platform as any).OS = 'android';

    expect(validateApiUrl()).toBe('http://10.0.2.2:3000');
  });

  it('rewrites a 127.0.0.1 env var to the Android emulator host in dev on Android', () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://127.0.0.1:3000';
    (global as any).__DEV__ = true;
    (Platform as any).OS = 'android';

    expect(validateApiUrl()).toBe('http://10.0.2.2:3000');
  });

  it('leaves a non-localhost env var untouched', () => {
    process.env.EXPO_PUBLIC_API_URL = 'https://api.buyootna.com';
    (global as any).__DEV__ = true;
    (Platform as any).OS = 'android';

    expect(validateApiUrl()).toBe('https://api.buyootna.com');
  });
});

describe('apiClient interceptors', () => {
  const requestSuccessHandler = mockRequestUse.mock.calls[0][0] as (
    config: any,
  ) => any;
  const responseErrorHandler = mockResponseUse.mock.calls[0][1] as (
    error: any,
  ) => Promise<any>;

  beforeEach(() => {
    setAuthToken(null);
    setOnUnauthorized(() => {});
  });

  it('created the shared axios instance via axios.create', () => {
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ timeout: 30000 }),
    );
    expect(apiClient).toBe(mockAxiosInstance);
  });

  describe('request interceptor', () => {
    it('adds an Authorization header once a token is set', async () => {
      setAuthToken('tok-1');
      const config = await requestSuccessHandler({ headers: {} });
      expect(config.headers.Authorization).toBe('Bearer tok-1');
    });

    it('omits the Authorization header when there is no token', async () => {
      setAuthToken(null);
      const config = await requestSuccessHandler({ headers: {} });
      expect(config.headers.Authorization).toBeUndefined();
    });

    // A profile switch: the new profile's screens load before its token
    // arrives, and must never load with the old profile's
    it('holds requests during a profile switch, then sends them with the new token', async () => {
      setAuthToken('tok-old');
      const release = holdRequestsForNewToken();
      let sent: any = null;
      const pending = requestSuccessHandler({ headers: {} }).then(
        (config: any) => {
          sent = config;
        },
      );

      await Promise.resolve();
      expect(sent).toBeNull();

      setAuthToken('tok-new');
      release();
      await pending;
      expect(sent.headers.Authorization).toBe('Bearer tok-new');
    });

    it('never holds the switch request itself', async () => {
      setAuthToken('tok-old');
      const release = holdRequestsForNewToken();
      const config = await requestSuccessHandler({
        headers: {},
        skipTokenHold: true,
      });
      expect(config.headers.Authorization).toBe('Bearer tok-old');
      release();
    });
  });

  describe('response interceptor', () => {
    it('invokes the unauthorized callback on a 401 when a token is set', async () => {
      const onUnauthorized = jest.fn();
      setOnUnauthorized(onUnauthorized);
      setAuthToken('tok-1');
      const error = { response: { status: 401 } };

      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });

    it('signs out on a 401 for a request sent with the current token', async () => {
      const onUnauthorized = jest.fn();
      setOnUnauthorized(onUnauthorized);
      setAuthToken('tok-1');
      const error = {
        response: { status: 401 },
        config: { headers: { Authorization: 'Bearer tok-1' } },
      };

      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });

    // QA (iOS): a screen opened at launch sent requests before the saved
    // sign-in was loaded; their 401s arrived after it and signed the user out
    it('does not sign out on a 401 for a request sent before the token was loaded', async () => {
      const onUnauthorized = jest.fn();
      setOnUnauthorized(onUnauthorized);
      setAuthToken('tok-1');
      const error = { response: { status: 401 }, config: { headers: {} } };

      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it('does not sign out on a 401 for a request sent with an earlier token', async () => {
      const onUnauthorized = jest.fn();
      setOnUnauthorized(onUnauthorized);
      setAuthToken('tok-2');
      const error = {
        response: { status: 401 },
        config: { headers: { Authorization: 'Bearer tok-1' } },
      };

      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it('does not invoke the unauthorized callback on a 401 when there is no token', async () => {
      const onUnauthorized = jest.fn();
      setOnUnauthorized(onUnauthorized);
      setAuthToken(null);
      const error = { response: { status: 401 } };

      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it('does not invoke the unauthorized callback on a non-401 error', async () => {
      const onUnauthorized = jest.fn();
      setOnUnauthorized(onUnauthorized);
      setAuthToken('tok-1');
      const error = { response: { status: 500 } };

      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(onUnauthorized).not.toHaveBeenCalled();
    });

    describe('network error retry', () => {
      beforeEach(() => {
        mockAxiosInstance.mockReset();
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('retries a genuine network error (no `response`) and resolves if the retry succeeds', async () => {
        const config: any = { url: '/properties/feed/home' };
        const networkError = { config };
        mockAxiosInstance.mockResolvedValueOnce({ data: 'ok' });

        const promise = responseErrorHandler(networkError);
        await jest.advanceTimersByTimeAsync(1200);

        await expect(promise).resolves.toEqual({ data: 'ok' });
        expect(mockAxiosInstance).toHaveBeenCalledTimes(1);
        expect(mockAxiosInstance).toHaveBeenCalledWith(
          expect.objectContaining({ __retryCount: 1 }),
        );
      });

      it('gives up and rejects with the original error once the retry budget is already spent', async () => {
        const config: any = {
          url: '/properties/feed/home',
          __retryCount: 4,
        };
        const networkError = { config };

        await expect(responseErrorHandler(networkError)).rejects.toBe(
          networkError,
        );
        expect(mockAxiosInstance).not.toHaveBeenCalled();
      });

      it.each(['post', 'PATCH', 'put', 'delete'])(
        'never re-sends a %s whose response was lost (it may already have happened)',
        async (method) => {
          const networkError = { config: { url: '/properties', method } };

          await expect(responseErrorHandler(networkError)).rejects.toBe(
            networkError,
          );
          expect(mockAxiosInstance).not.toHaveBeenCalled();
        },
      );

      it('does not retry a real HTTP error response from the server', async () => {
        const error = { response: { status: 500 }, config: { url: '/x' } };

        await expect(responseErrorHandler(error)).rejects.toBe(error);
        expect(mockAxiosInstance).not.toHaveBeenCalled();
      });
    });
  });
});
