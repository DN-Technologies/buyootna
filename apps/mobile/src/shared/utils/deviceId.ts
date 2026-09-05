import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'device_id';

function generateDeviceId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * A random opaque id persisted per app install, used only to let the backend
 * tell "this device" apart from others in the Active Sessions list. Not
 * security-sensitive (a collision just merges two devices' sessions), so no
 * crypto-grade randomness or extra native dependency is needed here.
 */
export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }

  const generated = generateDeviceId();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, generated);
  return generated;
}
