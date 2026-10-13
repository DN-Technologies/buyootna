import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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

import AppLogo from '@/shared/components/ui/AppLogo';
import { finishLaunch } from '@/shared/hooks/notifications/usePushRegistration';
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
 * Silently checks for a pending OTA update on cold launch, entirely behind
 * the native splash screen -- most opens have no new update, and the user
 * should never see anything different from a normal launch in that case.
 * Only once a real update is found do we switch to a visible progress
 * screen (matching the splash's own background/logo so the switch is
 * seamless) showing live download percentage via useUpdates().
 *
 * Deliberately does NOT call Updates.reloadAsync() -- forcing a full
 * JS-context reload this early in the launch lifecycle (before the app has
 * finished initializing) is a known crash risk on expo-updates. The
 * fetched update is left cached and expo-updates applies it automatically
 * on the next cold start, exactly like its default background-update
 * behavior -- this just adds visible feedback while the fetch happens
 * instead of doing it silently.
 *
 * Silently gives up and lets launch continue on any error, timeout, or
 * when there's simply nothing to update (dev builds, no update found).
 */
function UpdateGate({ onDone }: { onDone: () => void }) {
  const [isDownloadingUpdate, setIsDownloadingUpdate] = useState(false);
  const { downloadProgress } = Updates.useUpdates();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (__DEV__ || !Updates.isEnabled) {
        onDone();
        return;
      }

      try {
        const result = await withTimeout(
          Updates.checkForUpdateAsync(),
          CHECK_TIMEOUT_MS,
        );
        if (cancelled) return;

        if (!result.isAvailable) {
          // The common case: nothing new. Never show any UI for this --
          // proceed exactly like a normal launch.
          return;
        }

        // A real update exists -- only now do we switch to a visible
        // progress screen and actually fetch it.
        setIsDownloadingUpdate(true);
        await withTimeout(Updates.fetchUpdateAsync(), FETCH_TIMEOUT_MS);
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

  // Matches the native splash's own background/logo so this is seamless
  // whether or not it's actually showing anything different -- the native
  // splash (white bg, centered logo) stays up the whole time we're
  // silently checking; this view only diverges from it once we know a
  // download is genuinely happening.
  return (
    <View style={styles.updateContainer}>
      <AppLogo width={96} height={96} variant="icon" />
      {isDownloadingUpdate && (
        <>
          <ActivityIndicator
            size="small"
            color="#15304D"
            style={styles.updateSpinner}
          />
          <Text style={styles.updateText}>
            جاري تحميل التحديث... {Math.round((downloadProgress ?? 0) * 100)}%
          </Text>
        </>
      )}
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
      // A push that started the app opens now, on top of home. Not cleared
      // on unmount: the replace above is what unmounts this screen
      setTimeout(finishLaunch, 0);
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
      {/* Light icons over the dark-blue launch screen */}
      <StatusBar style="light" />

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
