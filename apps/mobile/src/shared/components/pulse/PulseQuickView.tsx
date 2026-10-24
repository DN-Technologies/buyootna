import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import type { PulseItem } from '@/shared/api/pulse.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import { PULSE_TONE_COLORS, pulseView } from './pulseItems';

// The most the quick view lists
const MAX_ROWS = 4;
const CARD_MAX_WIDTH = 340;
const NAVY = '#15304D';

interface PulseQuickViewProps {
  visible: boolean;
  items: PulseItem[];
  // Where the pill is on screen: the card opens under it, on its side
  anchor: { top: number; inset: number };
  onClose: () => void;
}

/**
 * The notch opened (the Dynamic Island's expanded view): a card under the
 * pill listing what's going on, each row saying what happened and what to
 * do, and opening its screen. A tap outside closes it.
 */
export default function PulseQuickView({
  visible,
  items,
  anchor,
  onClose,
}: PulseQuickViewProps) {
  const router = useRouter();
  const identity = useAuthStore((s) => s.activeIdentity?.type);
  const { width: screenWidth } = useWindowDimensions();
  const rows = items.slice(0, MAX_ROWS);
  const cardWidth = Math.min(CARD_MAX_WIDTH, screenWidth - anchor.inset * 2);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable
        testID="pulse-quick-view-backdrop"
        accessibilityLabel="إغلاق"
        className="flex-1"
        onPress={onClose}
      >
        {/* A light veil, so the card stands out from the home */}
        <Animated.View
          entering={FadeIn.duration(200)}
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(21, 48, 77, 0.10)' }]}
        />
        <View
          // The pill sits at the row's start (the right, in Arabic)
          className="absolute inset-x-0 items-start"
          style={{ top: anchor.top, paddingStart: anchor.inset }}
        >
          <Animated.View
            testID="pulse-quick-view"
            // Taps on the card itself don't reach the backdrop
            onStartShouldSetResponder={() => true}
            className="overflow-hidden rounded-[24px] bg-white"
            style={{
              width: cardWidth,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: PULSE_TONE_COLORS.gold,
              shadowColor: NAVY,
              shadowOpacity: 0.14,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 10 },
              elevation: 10,
            }}
          >
            <View className="flex-row items-center justify-between px-[16px] pb-[6px] pt-[14px]">
              <View className="flex-row items-center" style={{ gap: 6 }}>
                <View
                  className="size-[7px] rounded-full"
                  style={{ backgroundColor: PULSE_TONE_COLORS.gold }}
                />
                <Text className="text-right font-cairo-bold text-[14px] leading-[25px] text-[#15304D]">
                  يحدث الآن
                </Text>
              </View>
              <View className="h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#15304D] px-[7px]">
                <Text className="font-cairo-bold text-[11px] leading-[20px] text-white">
                  {rows.length}
                </Text>
              </View>
            </View>

            {rows.map((item, i) => {
              const view = pulseView(item, identity);
              const color = PULSE_TONE_COLORS[item.tone];
              return (
                <TouchableOpacity
                  key={item.kind}
                  testID={`pulse-row-${item.kind}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${view.title}، ${view.subtitle}`}
                  activeOpacity={0.6}
                  className="flex-row items-center px-[16px] py-[12px]"
                  style={{
                    gap: 12,
                    borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                    borderTopColor: '#ECECEC',
                  }}
                  onPress={() => {
                    onClose();
                    router.push(view.href);
                  }}
                >
                  {item.kind === 'providerStory' && item.avatarUrl ? (
                    <View
                      className="size-[42px] items-center justify-center rounded-full"
                      style={{ borderWidth: 2, borderColor: color }}
                    >
                      <Image
                        source={{ uri: item.avatarUrl }}
                        style={{ width: 34, height: 34, borderRadius: 17 }}
                        contentFit="cover"
                      />
                    </View>
                  ) : (
                    <View
                      className="size-[42px] items-center justify-center rounded-[14px]"
                      style={{ backgroundColor: `${color}1F` }}
                    >
                      <Feather name={view.icon} size={19} color={color} />
                    </View>
                  )}
                  {/* Starts at the row's start, right beside the icon (the
                      forced RTL swaps text-right to the far side) */}
                  <View className="flex-1 items-start">
                    <Text
                      numberOfLines={1}
                      className="font-cairo-semibold text-[14px] leading-[22px] text-[#111111]"
                    >
                      {view.title}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="font-cairo text-[12px] leading-[18px] text-[#6B6A6A]"
                    >
                      {view.subtitle}
                    </Text>
                  </View>
                  <View className="size-[26px] items-center justify-center rounded-full bg-[#F6F7F9]">
                    <Feather name="chevron-left" size={15} color={NAVY} />
                  </View>
                </TouchableOpacity>
              );
            })}
            <View className="h-[6px]" />
          </Animated.View>
        </View>
      </Pressable>
    </Modal>
  );
}
