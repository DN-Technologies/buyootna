import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import { verifyInstallation } from 'nativewind';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import AppLogo from '@/shared/components/AppLogo';
import { getIdentityHomeRoute } from '@/shared/navigation/getIdentityHomeRoute';
import { useAuthStore } from '@/shared/store/useAuthStore';

// A dead/slow network must never block launch indefinitely -- give each OTA
// step a ceiling, then fall through to the already-installed app.
const CHECK_TIMEOUT_MS = 6000;
const FETCH_TIMEOUT_MS = 20000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('OTA step timed out')), ms);
    }),
  ]);
}

/**
 * Holds the user on the splash background until a pending OTA update (if
 * any) has finished *downloading*, so they never sit on a screen that
 * silently updates itself mid-session. Deliberately does NOT call
 * Updates.reloadAsync() -- forcing a full JS-context reload this early in
 * the launch lifecycle (before the app has finished initializing) is a
 * known crash risk on expo-updates. The fetched update is left cached and
 * expo-updates applies it automatically on the next cold start, exactly
 * like its default background-update behavior -- this just adds visible
 * feedback while the fetch happens instead of doing it silently.
 *
 * Silently gives up and lets launch continue on any error, timeout, or
 * when there's simply nothing to update (dev builds, no update found).
 */
function UpdateGate({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Native splash was showing a static image; hide it now that this
      // screen is ready to take over.
      SplashScreen.hideAsync();

      if (__DEV__ || !Updates.isEnabled) {
        onDone();
        return;
      }

      try {
        const result = await withTimeout(
          Updates.checkForUpdateAsync(),
          CHECK_TIMEOUT_MS,
        );
        if (!cancelled && result.isAvailable) {
          await withTimeout(Updates.fetchUpdateAsync(), FETCH_TIMEOUT_MS);
        }
      } catch {
        // No network, no update, check/download timed out, etc.
      } finally {
        if (!cancelled) onDone();
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [onDone]);

  return (
    <View style={styles.updateContainer}>
      <AppLogo width={96} height={96} variant="icon" />
      <ActivityIndicator
        size="small"
        color="#15304D"
        style={styles.updateSpinner}
      />
      <Text style={styles.updateText}>جاري التحقق من وجود تحديث...</Text>
    </View>
  );
}

function InitialSplashSequence() {
  const [animationDone, setAnimationDone] = useState(false);
  const isLoading = useAuthStore((state) => state.isLoading);
  const activeIdentity = useAuthStore((state) => state.activeIdentity);

  // Animation Values
  const dotOpacity = useSharedValue(1);
  const bgColor = useSharedValue('#FFFFFF'); // White
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    verifyInstallation();

    // 1 Fade out dot
    dotOpacity.value = withDelay(350, withTiming(0, { duration: 210 }));

    // 2. Change background to dark blue (matching the design)
    bgColor.value = withDelay(560, withTiming('#0B2239', { duration: 350 }));

    // 3. Fade in logo, then mark the animation done
    logoOpacity.value = withDelay(
      910,
      withTiming(1, { duration: 420 }, (finished) => {
        if (finished) {
          runOnJS(setAnimationDone)(true);
        }
      }),
    );
  }, [bgColor, dotOpacity, logoOpacity]);

  // Route away only once the splash animation has finished AND persisted
  // auth/identity has been hydrated, so we redirect to the correct
  // experience (individual/company/office) instead of always landing on
  // individual home.
  useEffect(() => {
    if (animationDone && !isLoading) {
      router.replace(getIdentityHomeRoute(activeIdentity?.type));
    }
  }, [animationDone, isLoading, activeIdentity]);

  const animatedBackground = useAnimatedStyle(() => ({
    backgroundColor: bgColor.value,
  }));

  const animatedDot = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  const animatedLogo = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { alignItems: 'center', justifyContent: 'center' },
        animatedBackground,
      ]}
    >
      {/* Initial Dot */}
      <Animated.View
        className="absolute h-3 w-3 rounded-full bg-slate-800"
        style={[animatedDot]}
      />

      {/* Main Logo */}
      <Animated.View style={animatedLogo}>
        <AppLogo width={120} height={120} fill="#FFFFFF" />
      </Animated.View>
    </Animated.View>
  );
}

export default function InitialEntry() {
  const [updateChecked, setUpdateChecked] = useState(false);
  const handleUpdateDone = useCallback(() => setUpdateChecked(true), []);

  if (!updateChecked) {
    return <UpdateGate onDone={handleUpdateDone} />;
  }

  return <InitialSplashSequence />;
}

const styles = StyleSheet.create({
  updateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  updateSpinner: {
    marginTop: 24,
  },
  updateText: {
    marginTop: 12,
    fontFamily: 'Cairo_500Medium',
    fontSize: 14,
    color: '#6B6A6A',
  },
});
