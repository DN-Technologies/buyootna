import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { devicesService } from '@/shared/api/devices.service';
import { openAsPersona } from '@/shared/navigation/openAsPersona';

// Show pushes as a banner even while the app is open (e.g. a security alert)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    // The push carries the unread total for the app icon
    shouldSetBadge: true,
  }),
});

// Android plays the chat tone through this channel (the server sends its
// id with chat pushes). A channel's sound can't be changed once created, so
// it's only created by builds that bundle the tone (1.5.0+).
export const CHAT_CHANNEL_ID = 'chat-messages';
export const CHAT_SOUND = 'buyootna_message.wav';
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync(CHAT_CHANNEL_ID, {
    name: 'رسائل المحادثات',
    importance: Notifications.AndroidImportance.HIGH,
    sound: CHAT_SOUND,
    vibrationPattern: [0, 200, 100, 200],
  }).catch((e) => console.warn('Chat notification channel failed:', e));
}

function getProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
  );
}

// A push tapped while the app was closed is held until the launch screen
// has loaded the saved sign-in and moved to the home screen. Opened straight
// away, the screen sat on top of the launch screen: it loaded without the
// sign-in, and Back led to the launch screen instead of home.
let launching = true;
let heldRoute: { route: string; identityId?: string } | null = null;
let heldTimer: ReturnType<typeof setTimeout> | null = null;
// A launch that never reaches home (e.g. opened by a link) still opens it
const HELD_ROUTE_MAX_MS = 30000;

function openHeldRoute() {
  if (heldTimer) clearTimeout(heldTimer);
  heldTimer = null;
  const held = heldRoute;
  heldRoute = null;
  if (held) void openAsPersona(held.route, held.identityId);
}

/** Called once the launch screen has routed to the home screen. */
export function finishLaunch() {
  launching = false;
  openHeldRoute();
}

/** Test aid: back to the state of a freshly started app. */
export function resetLaunchForTests() {
  if (heldTimer) clearTimeout(heldTimer);
  heldTimer = null;
  heldRoute = null;
  launching = true;
}

/** Opens the screen a push points at, e.g. { route: '/devices' }. */
export function openPushRoute(
  response: Notifications.NotificationResponse | null,
) {
  const data = response?.notification.request.content.data;
  const route = data?.route;
  if (typeof route !== 'string' || !route.startsWith('/')) return;
  // The persona it's for (a request sent to the company): opened as it
  const identityId =
    typeof data?.identityId === 'string' ? data.identityId : undefined;
  if (!launching) {
    void openAsPersona(route, identityId);
    return;
  }
  heldRoute = { route, identityId };
  if (!heldTimer) {
    heldTimer = setTimeout(() => {
      launching = false;
      openHeldRoute();
    }, HELD_ROUTE_MAX_MS);
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
