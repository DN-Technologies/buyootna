import { TurboModuleRegistry } from 'react-native';

/**
 * Whether this binary ships the AsyncStorage native module.
 *
 * 1.4.0 binaries built before AsyncStorage was added (1f74535 — iOS build
 * 10, Android versionCode 4) still receive OTA updates for runtime 1.4.0.
 * There the import succeeds but every call throws, so callers check this
 * first instead of failing. Same lookup the library itself uses (returns
 * null when the module is absent, never throws).
 */
export function hasInstallStorage(): boolean {
  return TurboModuleRegistry.get('RNAsyncStorage') != null;
}
