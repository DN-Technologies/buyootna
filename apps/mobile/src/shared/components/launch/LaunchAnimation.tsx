import LottieView from 'lottie-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

/** The launch animation's background; the native splash is the same navy. */
export const LAUNCH_NAVY = '#0B2239';

// Frames of src/assets/animations/launch.json (the designer's F1 export,
// 60 fps). Its out point is trimmed to 336: the export ran to 393, the last
// second empty. The full logo holds from 251, then shrinks away by 336.
const LAST_FRAME = 336;
// Reduce Motion: this frame (the full logo), still
const STILL_FRAME = 280;
const STILL_MS = 600;
// Plays even if the native "loaded" event never comes
const LOAD_GRACE_MS = 500;
// Never hold launch: the full play is 5.6 s
const MAX_MS = 8000;

type Mode = 'full' | 'still';

/**
 * The app-opening animation on navy, in full (5.6 s) on every open, or
 * the full logo still with Reduce Motion. Calls `onDone` once, when it has
 * played (or failed, or taken too long).
 *
 * Needs lottie-react-native in the binary (1.6.1 and later). There's no
 * runtime check for it: on the new architecture a third-party native view
 * only registers once first drawn, so "is it registered" says no up front.
 * The 1.6.1 runtime version keeps this JS away from older binaries.
 */
export default function LaunchAnimation({ onDone }: { onDone: () => void }) {
  const reducedMotion = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const lottie = useRef<LottieView>(null);
  const mode: Mode = reducedMotion ? 'still' : 'full';
  const [loaded, setLoaded] = useState(false);
  const finished = useRef(false);
  const played = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  }, [onDone]);

  useEffect(() => {
    const timer = setTimeout(finish, MAX_MS);
    return () => clearTimeout(timer);
  }, [finish]);

  // Play once the composition has loaded (or the grace period has passed
  // without the event)
  useEffect(() => {
    if (mode === 'still') {
      const timer = setTimeout(finish, STILL_MS);
      return () => clearTimeout(timer);
    }
    const play = () => {
      if (played.current) return;
      played.current = true;
      lottie.current?.play(0, LAST_FRAME);
    };
    if (loaded) {
      play();
      return;
    }
    const timer = setTimeout(play, LOAD_GRACE_MS);
    return () => clearTimeout(timer);
  }, [loaded, mode, finish]);

  const onAnimationFinish = useCallback(
    (isCancelled: boolean) => {
      if (!isCancelled) finish();
    },
    [finish],
  );

  // The square composition, as wide as the screen (capped on tablets)
  const size = Math.min(width, height, 520);

  return (
    <View style={styles.container} testID="launch-animation">
      <LottieView
        ref={lottie}
        source={require('@/assets/animations/launch.json')}
        autoPlay={false}
        loop={false}
        resizeMode="contain"
        progress={mode === 'still' ? STILL_FRAME / LAST_FRAME : 0}
        onAnimationLoaded={() => setLoaded(true)}
        onAnimationFinish={onAnimationFinish}
        onAnimationFailure={finish}
        style={{ width: size, height: size }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LAUNCH_NAVY,
  },
});
