import { type ReactNode, useEffect } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface FadeHighlightProps {
  active: boolean;
  // The selected look: background, border, radius
  style?: ViewStyle;
  duration?: number;
  // Shown with it (centred): e.g. the white icon of a navy chip
  children?: ReactNode;
}

/**
 * A selected chip's background, faded in and out behind its content so a
 * selection changes smoothly instead of snapping. Put it first inside the
 * chip.
 */
const styles = StyleSheet.create({
  centred: { alignItems: 'center', justifyContent: 'center' },
});

export default function FadeHighlight({
  active,
  style,
  duration = 220,
  children,
}: FadeHighlightProps) {
  const opacity = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    opacity.value = withTiming(active ? 1 : 0, { duration });
  }, [active, duration, opacity]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        children ? styles.centred : null,
        style,
        animated,
      ]}
    >
      {children}
    </Animated.View>
  );
}
