import { renderHook, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { devicesService } from '@/shared/api/devices.service';

import {
  finishLaunch,
  openPushRoute,
  resetLaunchForTests,
  usePushRegistration,
} from '../usePushRegistration';

const mockDevice = { isDevice: true };

jest.mock('expo-device', () => ({
  get isDevice() {
    return mockDevice.isDevice;
  },
}));

jest.mock('expo-constants', () => ({
  expoConfig: { extra: { eas: { projectId: 'project-123' } } },
}));

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  addPushTokenListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  getLastNotificationResponseAsync: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('@/shared/api/devices.service', () => ({
  devicesService: { setPushToken: jest.fn(() => Promise.resolve()) },
}));

const N = Notifications as jest.Mocked<typeof Notifications>;
const TOKEN = 'ExponentPushToken[abc]';

describe('usePushRegistration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDevice.isDevice = true;
    N.getPermissionsAsync.mockResolvedValue({
      status: 'granted',
      canAskAgain: true,
    } as any);
    N.getExpoPushTokenAsync.mockResolvedValue({ data: TOKEN } as any);
  });

  it('registers the push token once signed in', async () => {
    await renderHook(() => usePushRegistration('auth-token'));

    await waitFor(() =>
      expect(devicesService.setPushToken).toHaveBeenCalledWith(TOKEN),
    );
    expect(N.getExpoPushTokenAsync).toHaveBeenCalledWith({
      projectId: 'project-123',
    });
    expect(N.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('asks for permission when not yet granted', async () => {
    N.getPermissionsAsync.mockResolvedValue({
      status: 'undetermined',
      canAskAgain: true,
    } as any);
    N.requestPermissionsAsync.mockResolvedValue({ status: 'granted' } as any);

    await renderHook(() => usePushRegistration('auth-token'));

    await waitFor(() =>
      expect(devicesService.setPushToken).toHaveBeenCalledWith(TOKEN),
    );
    expect(N.requestPermissionsAsync).toHaveBeenCalled();
  });

  it('does not register when the user denies permission', async () => {
    N.getPermissionsAsync.mockResolvedValue({
      status: 'denied',
      canAskAgain: false,
    } as any);

    await renderHook(() => usePushRegistration('auth-token'));

    await waitFor(() => expect(N.getPermissionsAsync).toHaveBeenCalled());
    expect(N.getExpoPushTokenAsync).not.toHaveBeenCalled();
    expect(devicesService.setPushToken).not.toHaveBeenCalled();
  });

  it('skips simulators', async () => {
    mockDevice.isDevice = false;

    await renderHook(() => usePushRegistration('auth-token'));

    await waitFor(() =>
      expect(N.addNotificationResponseReceivedListener).toHaveBeenCalled(),
    );
    expect(N.getPermissionsAsync).not.toHaveBeenCalled();
    expect(devicesService.setPushToken).not.toHaveBeenCalled();
  });

  it('does nothing while signed out', async () => {
    await renderHook(() => usePushRegistration(null));

    expect(N.getPermissionsAsync).not.toHaveBeenCalled();
    expect(devicesService.setPushToken).not.toHaveBeenCalled();
  });
});

describe('openPushRoute', () => {
  const response = (data: Record<string, unknown>) =>
    ({ notification: { request: { content: { data } } } }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
    resetLaunchForTests();
  });
  afterEach(() => jest.useRealTimers());

  it('opens the route a push points at once the app is running', () => {
    finishLaunch();
    openPushRoute(response({ route: '/devices' }));
    expect(router.push).toHaveBeenCalledWith('/devices');
  });

  // QA (iOS): a chat opened from a push that started the app sat on the
  // launch screen, loaded before the saved sign-in, and Back signed out
  it('holds a push that started the app until launch has reached home', () => {
    openPushRoute(response({ route: '/chat/c1' }));
    expect(router.push).not.toHaveBeenCalled();

    finishLaunch();
    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith('/chat/c1');

    // nothing left over for a second call
    finishLaunch();
    expect(router.push).toHaveBeenCalledTimes(1);
  });

  it('opens a held push once even when it is reported twice at launch', () => {
    openPushRoute(response({ route: '/chat/c1' }));
    openPushRoute(response({ route: '/chat/c1' }));
    finishLaunch();
    expect(router.push).toHaveBeenCalledTimes(1);
  });

  it('opens a held push anyway when launch never reaches home', () => {
    jest.useFakeTimers();
    openPushRoute(response({ route: '/chat/c1' }));
    jest.advanceTimersByTime(29000);
    expect(router.push).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(router.push).toHaveBeenCalledWith('/chat/c1');
  });

  it('ignores pushes without an in-app route', () => {
    openPushRoute(response({ route: 'https://evil.example' }));
    openPushRoute(response({}));
    openPushRoute(null);
    finishLaunch();
    expect(router.push).not.toHaveBeenCalled();
  });
});
