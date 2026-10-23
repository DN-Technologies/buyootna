import { type ReactNode, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface FadeLayerProps {
  active: boolean;
  children: ReactNode;
  duration?: number;
}

/**
 * One of several screens stacked in the same place, cross-faded as on iOS.
 * It stays mounted (and keeps its scroll) while another is shown: switching
 * is then only a fade, not a list being torn down and rebuilt mid-animation.
 * A hidden layer takes no touches and is skipped by screen readers.
 */
export default function FadeLayer({
  active,
  children,
  duration = 240,
}: FadeLayerProps) {
  // Starts hidden, so a layer opened for the first time fades in too
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withTiming(active ? 1 : 0, { duration });
  }, [active, duration, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      pointerEvents={active ? 'auto' : 'none'}
      accessibilityElementsHidden={!active}
      importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}
      style={[StyleSheet.absoluteFill, style]}
    >
      {children}
    </Animated.View>
  );
}
