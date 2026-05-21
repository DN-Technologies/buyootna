import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { verifyInstallation } from 'nativewind';

import AppLogo from '@/core/components/AppLogo';

export default function InitialSplashSequence() {
  const router = useRouter();

  // Animation Values
  const dotOpacity = useSharedValue(1);
  const bgColor = useSharedValue('#FFFFFF'); // White
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    verifyInstallation();
    // Hide native splash once this component mounts
    SplashScreen.hideAsync();

    // 1 Fade out dot
    dotOpacity.value = withDelay(500, withTiming(0, { duration: 300 }));

    // 2. Change background to dark blue (matching the design)
    bgColor.value = withDelay(800, withTiming('#0B2239', { duration: 500 }));

    // 3. Fade in logo, then route away
    logoOpacity.value = withDelay(
      1300,
      withTiming(1, { duration: 600 }, (finished) => {
        if (finished) {
          // trigger Expo Router navigation on JS thread
          runOnJS(router.replace)('(main)/home' as any);
        }
      }),
    );
  }, []);

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
