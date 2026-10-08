import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ReactNode } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

// Drag this far to the right to reply (like WhatsApp)
export const REPLY_SWIPE_DISTANCE = 60;
const MAX_DRAG = 90;

interface SwipeableMessageProps {
  children: ReactNode;
  onReply: () => void;
  onLongPress: () => void;
  // Briefly tinted after jumping to it from a quote
  highlighted?: boolean;
}

/**
 * A chat message: swipe it to the right to reply (WhatsApp-style, the reply
 * icon fades in behind it), or long-press for its options.
 */
export default function SwipeableMessage({
  children,
  onReply,
  onLongPress,
  highlighted = false,
}: SwipeableMessageProps) {
  const dragX = useSharedValue(0);
  const passed = useSharedValue(false);

  const tick = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };
  const reply = () => {
    tick();
    onReply();
  };
  const longPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onLongPress();
  };

  const pan = Gesture.Pan()
    // Rightward only; vertical scrolling and left swipes are left alone
    .activeOffsetX(12)
    .failOffsetX(-12)
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      dragX.value = Math.min(MAX_DRAG, Math.max(0, e.translationX));
      const crossed = dragX.value >= REPLY_SWIPE_DISTANCE;
      if (crossed && !passed.value) runOnJS(tick)();
      passed.value = crossed;
    })
    .onEnd(() => {
      if (dragX.value >= REPLY_SWIPE_DISTANCE) runOnJS(reply)();
      dragX.value = withSpring(0, { damping: 18, stiffness: 220 });
      passed.value = false;
    });

  const hold = Gesture.LongPress()
    .minDuration(350)
    .onStart(() => {
      runOnJS(longPress)();
    });

  const gesture = Gesture.Race(pan, hold);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }],
  }));
  const iconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(dragX.value, [0, REPLY_SWIPE_DISTANCE], [0, 1]),
    transform: [
      {
        scale: interpolate(dragX.value, [0, REPLY_SWIPE_DISTANCE], [0.6, 1]),
      },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        className={`rounded-lg ${highlighted ? 'bg-[#B28648]/15' : ''}`}
      >
        {/* Reply icon, revealed on the left as the message slides right */}
        <Animated.View
          pointerEvents="none"
          className="absolute bottom-0 left-2 top-0 justify-center"
          style={iconStyle}
        >
          <Feather name="corner-up-left" size={18} color="#B28648" />
        </Animated.View>
        <Animated.View style={bubbleStyle}>{children}</Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
