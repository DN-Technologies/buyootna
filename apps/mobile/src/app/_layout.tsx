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
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthStore } from '@/store/useAuthStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';

// Prevent auto-hide, we will hide it manually once our custom animated splash mounts
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const loadPersistedAuth = useAuthStore((state) => state.loadPersistedAuth);
  const token = useAuthStore((state) => state.token);
  const loadFavorites = useFavoritesStore((state) => state.loadFavorites);

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
      loadFavorites();
    }
  }, [token, loadFavorites]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(main)" />
            <Stack.Screen name="property/[id]" />
          </Stack>
        </SafeAreaProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
