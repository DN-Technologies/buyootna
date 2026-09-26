import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

import { devicesService } from '@/shared/api/devices.service';

// Show pushes as a banner even while the app is open (e.g. a security alert)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function getProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
  );
}

/** Opens the screen a push points at, e.g. { route: '/devices' }. */
export function openPushRoute(
  response: Notifications.NotificationResponse | null,
) {
  const route = response?.notification.request.content.data?.route;
  if (typeof route === 'string' && route.startsWith('/')) {
    router.push(route as any);
  }
}

async function getPushToken(): Promise<string | null> {
  // Simulators can't receive remote pushes
  if (!Device.isDevice) return null;

  let { status, canAskAgain } = await Notifications.getPermissionsAsync();
  if (status !== 'granted' && canAskAgain) {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') return null;

  const projectId = getProjectId();
  if (!projectId) return null;
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

/**
 * While signed in, registers this device's Expo push token on its session
 * so the backend can push security alerts (e.g. a login from another
 * device), and opens the right screen when a push is tapped.
 */
export function usePushRegistration(authToken: string | null) {
  const sentTokenRef = useRef<string | null>(null);

  // Register (once per sign-in) and keep the token current
  useEffect(() => {
    if (!authToken) {
      sentTokenRef.current = null;
      return;
    }

    let cancelled = false;
    const send = async (pushToken: string | null) => {
      if (cancelled || !pushToken || pushToken === sentTokenRef.current) return;
      try {
        await devicesService.setPushToken(pushToken);
        sentTokenRef.current = pushToken;
      } catch (e) {
        console.warn('Failed to register push token:', e);
      }
    };

    getPushToken()
      .then(send)
      .catch((e) => console.warn('Push registration failed:', e));

    const subscription = Notifications.addPushTokenListener(({ data }) => {
      if (typeof data === 'string') send(data);
    });

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, [authToken]);

  // Tapping a push: while running, and the one that cold-started the app
  useEffect(() => {
    const subscription =
      Notifications.addNotificationResponseReceivedListener(openPushRoute);
    Notifications.getLastNotificationResponseAsync()
      .then(openPushRoute)
      .catch(() => undefined);
    return () => subscription.remove();
  }, []);
}
