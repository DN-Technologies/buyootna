import { useEffect } from 'react';
import {
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { IOS_SPRING } from '@/shared/components/ui/SlidingSegment';

import {
  ACTIONS_WIDTH,
  CLOSED_SLOT,
  NUDGE_PAUSE_MS,
  NUDGE_PX,
  NUDGE_STEP_MS,
  PULSE_SLOT,
} from './constants';

interface PillMotionOptions {
  open: boolean;
  // Something unread: the closed ‹ nudges
  unread: boolean;
  // The notch shows: the closed slot widens for it
  notch: boolean;
}

/**
 * The pill's motion. One spring drives opening: the slot grows from beside
 * the photo (which never moves), the icons fade in, the gap fades out, ‹
 * turns to ›. The closed slot widens for the notch, and ‹ nudges while
 * something is unread (never with Reduce Motion).
 */
export function usePillMotion({ open, unread, notch }: PillMotionOptions) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const closedSlot = useSharedValue(CLOSED_SLOT);
  const nudge = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(open ? 1 : 0, IOS_SPRING);
  }, [open, progress]);

  useEffect(() => {
    closedSlot.value = withSpring(notch ? PULSE_SLOT : CLOSED_SLOT, IOS_SPRING);
  }, [notch, closedSlot]);

  const nudging = unread && !open && !reduceMotion;
  useEffect(() => {
    if (!nudging) {
      cancelAnimation(nudge);
      nudge.value = withTiming(0, { duration: NUDGE_STEP_MS });
      return;
    }
    const step = (to: number) => withTiming(to, { duration: NUDGE_STEP_MS });
    // A short shake, then a rest; for as long as something is unread
    nudge.value = withRepeat(
      withSequence(
        withDelay(NUDGE_PAUSE_MS, step(-NUDGE_PX)),
        step(NUDGE_PX),
        step(-NUDGE_PX),
        step(NUDGE_PX),
        step(0),
      ),
      -1,
    );
    return () => cancelAnimation(nudge);
  }, [nudging, nudge]);

  const slotStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [closedSlot.value, ACTIONS_WIDTH]),
    opacity: interpolate(progress.value, [0, 0.35, 1], [0, 0, 1]),
  }));
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: nudge.value },
      { rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg` },
    ],
  }));
  const gapStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.3], [1, 0], 'clamp'),
  }));

  return { slotStyle, chevronStyle, gapStyle };
}
