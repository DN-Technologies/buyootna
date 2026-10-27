import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { verifyInstallation } from 'nativewind';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { LAUNCH_NAVY } from '@/shared/components/launch/LaunchAnimation';
import { useLaunchOverlay } from '@/shared/components/launch/LaunchOverlay';
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
 * screen (on the splash's own navy so the switch is seamless) showing
 * live download percentage via useUpdates().
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

  // The native splash's plain navy while silently checking, so nothing
  // changes on screen; it only diverges once a download is genuinely
  // happening.
  return (
    <View style={styles.updateContainer}>
      <StatusBar style="light" />
      {isDownloadingUpdate && (
        <>
          <AppLogo width={96} height={96} variant="icon" />
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
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
  const showLaunch = useLaunchOverlay((s) => s.show);
  const isLoading = useAuthStore((state) => state.isLoading);
  const activeIdentity = useAuthStore((state) => state.activeIdentity);

  // The launch animation plays over the app (LaunchOverlay, in the root
  // layout), so home can open and render beneath it
  useEffect(() => {
    verifyInstallation();
    showLaunch();
  }, [showLaunch]);

  // Route once persisted auth/identity has been hydrated, so we land on the
  // correct experience (individual/company/office) instead of always the
  // individual home
  useEffect(() => {
    if (!isLoading) {
      router.replace(getIdentityHomeRoute(activeIdentity?.type));
      // A push that started the app opens now, on top of home. Not cleared
      // on unmount: the replace above is what unmounts this screen
      setTimeout(finishLaunch, 0);
    }
  }, [isLoading, activeIdentity]);

  // Navy under the overlay, should hydration outlast the animation
  return (
    <View style={styles.launchBackground}>
      <StatusBar style="light" />
    </View>
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
  launchBackground: {
    flex: 1,
    backgroundColor: LAUNCH_NAVY,
  },
  updateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LAUNCH_NAVY,
  },
  updateSpinner: {
    marginTop: 24,
  },
  updateText: {
    marginTop: 12,
    fontFamily: 'Cairo_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
