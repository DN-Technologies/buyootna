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
import { QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FAVORITE_IDS_QUERY_KEY } from '@/features/individual/hooks/useFavorites';
import { favoritesService } from '@/features/individual/services/favorites.service';
import { queryClient } from '@/shared/api/queryClient';
import { useAuthStore } from '@/shared/store/useAuthStore';

// Prevent auto-hide, we will hide it manually once our custom animated splash mounts
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const loadPersistedAuth = useAuthStore((state) => state.loadPersistedAuth);
  const token = useAuthStore((state) => state.token);

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

  if (!loaded && !error) {
    return null;
  }

  return (
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
          </SafeAreaProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
