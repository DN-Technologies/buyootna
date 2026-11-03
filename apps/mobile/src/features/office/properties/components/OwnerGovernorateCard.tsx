import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import type { OwnerGovernorateSummary } from '../officeProperties';

// Figma shows five categories, then "+N" for the rest
const MAX_CHIPS = 5;

function Chip({ label }: { label: string }) {
  return (
    <View
      className="h-5 items-center justify-center bg-[#F9FAFE] px-2"
      // Figma "states" (owner card): rounded on three corners
      style={{
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        borderTopRightRadius: 8,
      }}
    >
      <Text
        numberOfLines={1}
        className="font-almarai text-[13px] leading-[16px] text-[#15304D]"
      >
        {label}
      </Text>
    </View>
  );
}

/**
 * One governorate on the office's own عقارات tab (Figma 4494:145548): its
 * categories, how many ads, how many of them featured. Opens its ads.
 */
export default function OwnerGovernorateCard({
  summary,
  onPress,
}: {
  summary: OwnerGovernorateSummary;
  onPress: () => void;
}) {
  const shown = summary.categories.slice(0, MAX_CHIPS);
  const rest = summary.categories.length - shown.length;

  return (
    <TouchableOpacity
      testID={`owner-governorate-${summary.governorateId}`}
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={summary.title}
      className="w-full rounded-[6px] border-[0.5px] border-[#ECECEC] bg-white"
      style={{ gap: 6 }}
    >
      <View
        className="w-full items-start px-4 pb-2 pt-[14px]"
        style={{ gap: shown.length ? 14 : 12 }}
      >
        <Text
          className="font-cairo-medium text-[16px] leading-[21px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {summary.title}
        </Text>
        {shown.length > 0 && (
          <View className="flex-row flex-wrap items-center" style={{ gap: 8 }}>
            {shown.map((label) => (
              <Chip key={label} label={label} />
            ))}
            {rest > 0 && <Chip label={`${rest}+`} />}
          </View>
        )}
      </View>

      <View className="w-full flex-row items-center justify-between rounded-b-[8px] border-[0.5px] border-[#D7D7D7] bg-white px-4 py-3">
        <Text
          testID={`owner-governorate-${summary.governorateId}-count`}
          className="font-cairo-medium text-[13px] leading-[20px] text-[#111111]"
        >
          {summary.count} عقارات
        </Text>
        <View className="flex-row items-center py-0.5" style={{ gap: 4 }}>
          <Image
            source={require('@/assets/icons/office-properties/featured-dot.svg')}
            style={{ width: 8, height: 8 }}
          />
          <Text className="font-cairo-medium text-[13px] leading-[20px] text-[#111111]">
            {summary.featuredCount} عقارات مميزة
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
