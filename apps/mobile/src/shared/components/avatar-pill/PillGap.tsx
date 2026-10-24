import { Feather } from '@expo/vector-icons';
import type { ViewStyle } from 'react-native';
import { Text } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import type { PulseItem } from '@/shared/api/pulse.service';
import PulseNotch from '@/shared/components/pulse/PulseNotch';

import { GOLD, PULSE_SLOT, SLOT_OFFSET } from './constants';
import { timeOfDayGlyph } from './timeOfDay';

// What the gap between the photo and ‹ shows, most pressing first
export type PillGapState = 'unread' | 'pulse' | 'time' | null;

export function pillGapState(
  signedIn: boolean,
  unread: number,
  pulse: PulseItem[],
): PillGapState {
  if (!signedIn) return null;
  if (unread > 0) return 'unread';
  return pulse.length > 0 ? 'pulse' : 'time';
}

interface PillGapProps {
  state: PillGapState;
  unread: number;
  pulse: PulseItem[];
  open: boolean;
  quickViewOpen: boolean;
  // Fades out as the pill opens
  fadeStyle: AnimatedStyle<ViewStyle>;
  onOpenQuickView: () => void;
}

/**
 * The gap beside the photo: the red unread count, else the notch (what's
 * going on, opening the quick view), else the time of day.
 */
export default function PillGap({
  state,
  unread,
  pulse,
  open,
  quickViewOpen,
  fadeStyle,
  onOpenQuickView,
}: PillGapProps) {
  if (state === 'unread') {
    return (
      // Figma's count sits over the photo's edge, beside the chevron
      <Animated.View
        testID="avatar-pill-count"
        pointerEvents="none"
        className="absolute size-[14px] items-center justify-center rounded-full bg-[#BA0003]"
        // The app's RTL swaps left and right: this is Figma's left 24
        style={[{ right: 24, top: 16 }, fadeStyle]}
      >
        <Text className="font-cairo-bold text-[8px] leading-[12px] text-white">
          {unread > 9 ? '9+' : unread}
        </Text>
      </Animated.View>
    );
  }

  if (state === 'pulse') {
    return (
      // In the widened slot between the photo and ‹. The app's RTL swaps
      // left and right: this is from the ‹ side
      <Animated.View
        pointerEvents={open ? 'none' : 'auto'}
        className="absolute items-center justify-center"
        style={[
          { right: SLOT_OFFSET, top: 4, bottom: 4, width: PULSE_SLOT },
          fadeStyle,
        ]}
      >
        <PulseNotch
          items={pulse}
          paused={open || quickViewOpen}
          onPress={onOpenQuickView}
        />
      </Animated.View>
    );
  }

  if (state === 'time') {
    // Read on each render: the badges reload on every focus of the home
    const glyph = timeOfDayGlyph(new Date().getHours());
    return (
      <Animated.View
        testID="avatar-pill-time"
        pointerEvents="none"
        accessibilityLabel={glyph.label}
        className="absolute size-[14px] items-center justify-center"
        style={[{ right: 24, top: 16 }, fadeStyle]}
      >
        <Feather
          testID={`avatar-pill-time-${glyph.icon}`}
          name={glyph.icon}
          size={12}
          color={GOLD}
        />
      </Animated.View>
    );
  }

  return null;
}
