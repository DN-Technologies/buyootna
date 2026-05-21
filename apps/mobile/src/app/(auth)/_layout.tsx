import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="selection" />
      <Stack.Screen name="individual-auth" />
      <Stack.Screen name="company-auth" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
