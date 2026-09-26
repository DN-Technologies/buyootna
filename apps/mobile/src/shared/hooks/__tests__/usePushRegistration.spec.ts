import { renderHook, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { devicesService } from '@/shared/api/devices.service';

import { openPushRoute, usePushRegistration } from '../usePushRegistration';

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

  beforeEach(() => jest.clearAllMocks());

  it('opens the route a push points at', () => {
    openPushRoute(response({ route: '/devices' }));
    expect(router.push).toHaveBeenCalledWith('/devices');
  });

  it('ignores pushes without an in-app route', () => {
    openPushRoute(response({ route: 'https://evil.example' }));
    openPushRoute(response({}));
    openPushRoute(null);
    expect(router.push).not.toHaveBeenCalled();
  });
});
