import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuthStore } from '@/shared/store/useAuthStore';

export default function AddListingLayout() {
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isLoading && !token) {
      // If auth load finished and no token is present, redirect to selection screen
      router.replace('/(auth)/selection');
    }
  }, [token, isLoading]);

  if (isLoading || !token) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#15304D" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="preview" />
    </Stack>
  );
}
