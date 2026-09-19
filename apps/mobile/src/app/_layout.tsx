import 'react-native-gesture-handler';
import 'react-native-reanimated';
import './globals.css';

import {
  Almarai_400Regular,
  Almarai_700Bold,
} from '@expo-google-fonts/almarai';
import {
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_600SemiBold,
  Cairo_700Bold,
  useFonts,
} from '@expo-google-fonts/cairo';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as Sentry from '@sentry/react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack, useNavigationContainerRef } from 'expo-router';
import { Component, ReactNode, useEffect } from 'react';
import { I18nManager, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { favoritesService } from '@/shared/api/favorites.service';
import { queryClient } from '@/shared/api/queryClient';
import AppAlertModal from '@/shared/components/AppAlertModal';
import { FAVORITE_IDS_QUERY_KEY } from '@/shared/hooks/useFavorites';
import { useAuthStore } from '@/shared/store/useAuthStore';

// Screen-transition performance + breadcrumbs. The nav container ref gets
// registered on it once RootLayout mounts, below.
const routingInstrumentation = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

// Enabled only once EXPO_PUBLIC_SENTRY_DSN is configured — a clean no-op
// locally until then, so this never breaks dev without Sentry set up.
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || undefined,
  enabled: !!process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableNativeCrashHandling: true,
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  integrations: [
    routingInstrumentation,
    // Traces outgoing API calls (apiClient's axios instance uses XHR under
    // RN, which traceXHR covers by default) and reports request timings.
    Sentry.reactNativeTracingIntegration(),
    // JS-thread stall tracking — surfaces real jank, not just crashes.
    Sentry.stallTrackingIntegration(),
  ],
});

// Prevent auto-hide, we will hide it manually once our custom animated splash mounts
SplashScreen.preventAutoHideAsync();

class RootErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    Sentry.captureException(error, {
      extra: { componentStack: info.componentStack },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <Text style={{ fontSize: 16, textAlign: 'center' }}>
            حدث خطأ غير متوقع. يرجى إعادة تشغيل التطبيق.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function RootLayout() {
  const loadPersistedAuth = useAuthStore((state) => state.loadPersistedAuth);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const navigationRef = useNavigationContainerRef();

  const [loaded, error] = useFonts({
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_600SemiBold,
    Cairo_700Bold,
    Almarai_400Regular,
    Almarai_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    // Force RTL for Arabic support
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
      I18nManager.allowRTL(true);
      // Note: Might require an app reload on first install to take effect
    }
  }, []);

  useEffect(() => {
    // Safely hydrate our authentication tokens from hardware storage
    loadPersistedAuth();
  }, [loadPersistedAuth]);

  useEffect(() => {
    if (token) {
      queryClient.prefetchQuery({
        queryKey: FAVORITE_IDS_QUERY_KEY,
        queryFn: async () => (await favoritesService.getFavoriteIds()).ids,
      });
    }
  }, [token]);

  // Register the router's nav container so Sentry can trace screen
  // transitions (routingInstrumentation is created once at module scope).
  useEffect(() => {
    routingInstrumentation.registerNavigationContainer(navigationRef);
  }, [navigationRef]);

  // Attach/clear the current user so crashes and traces are attributable
  // to a specific account instead of being anonymous.
  useEffect(() => {
    Sentry.setUser(
      user
        ? { id: user.id, email: user.email ?? undefined, username: user.name ?? undefined }
        : null,
    );
  }, [user]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <RootErrorBoundary>
      <Sentry.TouchEventBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <SafeAreaProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(individual)" />
                  <Stack.Screen name="(company)" />
                  <Stack.Screen name="(office)" />
                  <Stack.Screen name="property/[id]" />
                </Stack>
                <AppAlertModal />
              </SafeAreaProvider>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </Sentry.TouchEventBoundary>
    </RootErrorBoundary>
  );
}

export default Sentry.wrap(RootLayout);
