import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { formatTimeAgo } from '@/shared/utils/helpers/time';
import type { OfficeGovernorateGroup } from '@/shared/utils/office/officeListings';

// The design shows five categories, then "+N" for the rest
const MAX_CHIPS = 5;

function Chip({ label }: { label: string }) {
  return (
    <View
      className="h-5 items-center justify-center bg-[#F9FAFE] px-2"
      // Figma "states": rounded on three corners
      style={{
        borderTopLeftRadius: 8,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
      }}
    >
      <Text
        numberOfLines={1}
        className="font-almarai text-[12px] leading-[16px] text-[#15304D]"
      >
        {label}
      </Text>
    </View>
  );
}

interface OfficeGovernorateCardProps {
  group: OfficeGovernorateGroup;
  onPress: () => void;
}

/**
 * One governorate on an office profile's الاعلانات tab (Figma 1258:121151):
 * its name, the categories the office lists there, how many ads and when
 * the newest went up. Opens that governorate's ads.
 */
export default function OfficeGovernorateCard({
  group,
  onPress,
}: OfficeGovernorateCardProps) {
  const shown = group.categories.slice(0, MAX_CHIPS);
  const rest = group.categories.length - shown.length;
  const latest = formatTimeAgo(group.latestAt);

  return (
    <TouchableOpacity
      testID={`office-governorate-${group.governorateId}`}
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={group.title}
      className="w-full rounded-[6px] border-[0.5px] border-[#ECECEC] bg-white"
      style={{ gap: 6 }}
    >
      <View className="w-full items-start px-4 pb-2 pt-[14px]" style={{ gap: 6 }}>
        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]">
          <Feather name="home" size={17} color="#111111" />
        </View>
        <Text
          className="font-cairo-medium text-[16px] leading-[24px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {group.title}
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
        <Text className="font-cairo-medium text-[13px] leading-[20px] text-[#111111]">
          {group.count} عقارات
        </Text>
        {!!latest && (
          <View className="flex-row items-center" style={{ gap: 4 }}>
            <View className="h-2 w-2 rounded-full bg-[#15A72B]" />
            <Text className="font-cairo-medium text-[13px] leading-[20px] text-[#111111]">
              اخر الاعلانات {latest}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
