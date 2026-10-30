import { useEffect } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { STORY_VIDEO_MAX_MS } from '@/features/stories/storyPhoto';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 84;
const STROKE = 5;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// Held this long it's a video, not a photo (as on Instagram)
export const HOLD_MS = 250;
// Dragging up this far while recording zooms all the way in
const ZOOM_DRAG = 300;

interface CaptureButtonProps {
  recording: boolean;
  disabled?: boolean;
  // The longest recording, for the ring: a story's 30 seconds unless told
  maxMs?: number;
  onPhoto: () => void;
  onHoldStart: () => void;
  onHoldEnd: () => void;
  // 0..1 zoom while dragging up during a hold
  onHoldZoom: (delta: number) => void;
}

/**
 * The shutter: a tap takes a photo; held, it records until let go (or the
 * story limit), a gold ring filling as it goes; dragging up zooms.
 */
export default function CaptureButton({
  recording,
  disabled = false,
  maxMs = STORY_VIDEO_MAX_MS,
  onPhoto,
  onHoldStart,
  onHoldEnd,
  onHoldZoom,
}: CaptureButtonProps) {
  const progress = useSharedValue(0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    if (recording) {
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: maxMs,
        easing: Easing.linear,
      });
    } else {
      cancelAnimation(progress);
      progress.value = 0;
    }
  }, [recording, progress]);

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .maxDuration(HOLD_MS)
    .runOnJS(true)
    .onEnd((_e, success) => {
      if (success) onPhoto();
    });

  const hold = Gesture.Pan()
    .enabled(!disabled)
    .activateAfterLongPress(HOLD_MS)
    .runOnJS(true)
    .onStart(() => {
      pressed.value = withTiming(1, { duration: 150 });
      onHoldStart();
    })
    .onUpdate((e) => {
      onHoldZoom(Math.max(0, -e.translationY) / ZOOM_DRAG);
    })
    .onFinalize((_e, success) => {
      pressed.value = withTiming(0, { duration: 150 });
      if (success) onHoldEnd();
    });

  // A hold wins once it's long enough; a short press is a tap
  const gesture = Gesture.Exclusive(hold, tap);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));
  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.25 }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View
        testID="story-camera-shutter"
        accessibilityRole="button"
        accessibilityLabel="اضغط لالتقاط صورة، أو اضغط مطولاً لتسجيل فيديو"
        accessibilityState={{ disabled }}
        style={{ width: SIZE, height: SIZE, opacity: disabled ? 0.5 : 1 }}
        className="items-center justify-center"
      >
        <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="rgba(255,255,255,0.9)"
            strokeWidth={STROKE}
            fill="none"
          />
          {recording && (
            <AnimatedCircle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#C5A36D"
              strokeWidth={STROKE}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              animatedProps={ringProps}
              strokeLinecap="round"
              // Fills clockwise from the top
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          )}
        </Svg>
        <Animated.View
          style={[
            {
              width: SIZE - 20,
              height: SIZE - 20,
              borderRadius: (SIZE - 20) / 2,
              backgroundColor: recording ? '#E5484D' : '#FFFFFF',
            },
            innerStyle,
          ]}
        />
      </View>
    </GestureDetector>
  );
}
