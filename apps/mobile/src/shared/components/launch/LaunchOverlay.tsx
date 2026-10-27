import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { create } from 'zustand';

import LaunchAnimation from './LaunchAnimation';

const FADE_MS = 250;

interface LaunchOverlayState {
  visible: boolean;
  shown: boolean;
  /** Starts the launch animation; only once per app start. */
  show: () => void;
  hide: () => void;
}

export const useLaunchOverlay = create<LaunchOverlayState>((set, get) => ({
  visible: false,
  shown: false,
  show: () => {
    if (get().shown) return;
    set({ visible: true, shown: true });
  },
  hide: () => set({ visible: false }),
}));

/**
 * The launch animation over the whole app (rendered last in the root
 * layout). The home screen opens and renders underneath while it plays, so
 * when it ends this fades out onto a ready home instead of a blank screen.
 */
export default function LaunchOverlay() {
  const visible = useLaunchOverlay((s) => s.visible);
  const hide = useLaunchOverlay((s) => s.hide);
  const opacity = useSharedValue(1);
  const [fading, setFading] = useState(false);

  const onDone = useCallback(() => {
    setFading(true);
    opacity.value = withTiming(0, { duration: FADE_MS }, (finished) => {
      if (finished) runOnJS(hide)();
    });
  }, [opacity, hide]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, style]}
      // Touches reach the app once the fade starts
      pointerEvents={fading ? 'none' : 'auto'}
      testID="launch-overlay"
    >
      {/* Light icons over navy; the app's dark ones come back on unmount */}
      <StatusBar style="light" />
      <LaunchAnimation onDone={onDone} />
    </Animated.View>
  );
}
