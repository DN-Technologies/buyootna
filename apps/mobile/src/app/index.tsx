import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { verifyInstallation } from 'nativewind';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
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

export default function InitialSplashSequence() {
  const [animationDone, setAnimationDone] = useState(false);
  const isLoading = useAuthStore((state) => state.isLoading);
  const activeIdentity = useAuthStore((state) => state.activeIdentity);

  // Animation Values
  const dotOpacity = useSharedValue(1);
  const bgColor = useSharedValue('#FFFFFF'); // White
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    verifyInstallation();
    // Hide native splash once this component mounts
    SplashScreen.hideAsync();

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
