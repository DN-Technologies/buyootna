import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="selection" />
      <Stack.Screen name="individual-auth" />
      <Stack.Screen name="business-auth" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="add-identity" />
      <Stack.Screen name="add-identity-individual" />
      <Stack.Screen name="add-identity-company" />
      <Stack.Screen name="add-identity-office" />
    </Stack>
  );
}
