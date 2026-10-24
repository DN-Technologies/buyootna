import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import type { PulseItem } from '@/shared/api/pulse.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import { PULSE_TONE_COLORS, pulseView } from './pulseItems';

// With several items, the notch shows each in turn this long
export const PULSE_CYCLE_MS = 4000;

interface PulseNotchProps {
  items: PulseItem[];
  // Stops on one item (while the pill or the quick view is open)
  paused?: boolean;
  onPress: () => void;
}

/**
 * The closed pill's notch: one glyph and a number for what's going on,
 * taking turns when there are several (like the Dynamic Island's compact
 * view). A tap opens the quick view.
 */
export default function PulseNotch({ items, paused, onPress }: PulseNotchProps) {
  const identity = useAuthStore((s) => s.activeIdentity?.type);
  const [index, setIndex] = useState(0);
  const cycling = items.length > 1 && !paused;

  useEffect(() => {
    if (!cycling) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % items.length),
      PULSE_CYCLE_MS,
    );
    return () => clearInterval(timer);
  }, [cycling, items.length]);

  const item = items[index % items.length];
  if (!item) return null;
  const view = pulseView(item, identity);
  const color = PULSE_TONE_COLORS[item.tone];

  return (
    <TouchableOpacity
      testID="pulse-notch"
      accessibilityRole="button"
      accessibilityLabel={view.title}
      accessibilityHint="يعرض ما يحدث في حسابك"
      hitSlop={8}
      onPress={onPress}
    >
      {/* Keyed by item: each one fades in as it takes its turn */}
      <Animated.View key={`${item.kind}-${index}`} entering={FadeIn.duration(250)}>
        {item.kind === 'providerStory' && item.avatarUrl ? (
          <View
            testID={`pulse-notch-${item.kind}`}
            className="size-[30px] items-center justify-center rounded-full bg-white"
            style={{ borderWidth: 2, borderColor: color }}
          >
            <Image
              source={{ uri: item.avatarUrl }}
              style={{ width: 23, height: 23, borderRadius: 12 }}
              contentFit="cover"
            />
          </View>
        ) : (
          <View
            testID={`pulse-notch-${item.kind}`}
            // A navy capsule, like the Dynamic Island: the glyph in its
            // tone, the number in white
            className="h-[30px] min-w-[30px] flex-row items-center justify-center rounded-full bg-[#15304D] px-[8px]"
            style={{ gap: 4 }}
          >
            <Feather name={view.icon} size={16} color={color} />
            {view.short !== '' && (
              <Text className="font-cairo-bold text-[12px] leading-[20px] text-white">
                {view.short}
              </Text>
            )}
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}
