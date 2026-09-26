import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { formatRelativeMatchTime } from '@/features/individual/utils/alertCard';

export interface AlertDetailsActionsProps {
  matchCount?: number;
  lastMatchedAt?: string | null;
  onViewMatchesPress?: () => void;
  onEditPress?: () => void;
  onDeletePress?: () => void;
}

export default function AlertDetailsActions({
  matchCount = 0,
  lastMatchedAt,
  onViewMatchesPress,
  onEditPress,
  onDeletePress,
}: AlertDetailsActionsProps) {
  return (
    <View className="gap-3 pt-2">
      {/* Matched listings for this alert */}
      <TouchableOpacity
        onPress={onViewMatchesPress}
        activeOpacity={0.7}
        className="flex-row items-center justify-between rounded-[6px] bg-[#F5F7F9] px-3 py-2.5"
        accessibilityLabel="عرض العقارات المطابقة"
        testID="alert-details-matches-btn"
      >
        <View className="items-start">
          <Text
            className="font-cairo-semibold text-[13px] text-[#15304D]"
            style={{ writingDirection: 'rtl' }}
          >
            العقارات المطابقة
          </Text>
          <Text
            className="font-cairo text-[12px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            {matchCount > 0
              ? `${matchCount} تطابق · ${formatRelativeMatchTime(lastMatchedAt)}`
              : formatRelativeMatchTime(lastMatchedAt)}
          </Text>
        </View>
        <Feather name="chevron-left" size={20} color="#15304D" />
      </TouchableOpacity>

      {/* [حذف] (Left) <---> [تعديل] (Right) */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onEditPress}
          activeOpacity={0.8}
          className="h-[44px] flex-1 items-center justify-center rounded-full bg-[#15304D] px-5"
          accessibilityLabel="تعديل التنبيه"
          testID="alert-details-edit-btn"
        >
          <Text
            className="font-cairo-semibold text-[14px] tracking-[0.28px] text-white"
            style={{ writingDirection: 'rtl' }}
          >
            تعديل
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDeletePress}
          activeOpacity={0.8}
          className="h-[44px] flex-1 items-center justify-center rounded-full border border-[#D7D7D7] bg-white px-5"
          accessibilityLabel="حذف التنبيه"
          testID="alert-details-delete-btn"
        >
          <Text
            className="font-cairo-semibold text-[14px] tracking-[0.28px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            حذف
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
