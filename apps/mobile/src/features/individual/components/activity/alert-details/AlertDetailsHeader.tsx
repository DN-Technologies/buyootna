import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import AlertToggle from '@/features/individual/components/activity/alert-card/AlertToggle';

export interface AlertDetailsHeaderProps {
  title: string;
  isActive: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

// [Close + Toggle] (Left) <---> [Title] (Right)
export default function AlertDetailsHeader({
  title,
  isActive,
  onToggle,
  onClose,
}: AlertDetailsHeaderProps) {
  return (
    <View className="flex-row items-center justify-between border-b border-[#F5F7F9] pb-3">
      <Text
        className="text-right font-cairo-semibold text-[17px] leading-[24px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
        numberOfLines={1}
      >
        {title}
      </Text>

      <View className="flex-row items-center gap-3">
        <AlertToggle
          isOn={isActive}
          onToggle={onToggle}
          size="lg"
          testID="alert-details-toggle-btn"
        />
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.7}
          className="size-8 items-center justify-center rounded-full"
          accessibilityLabel="إغلاق تفاصيل التنبيه"
          testID="alert-details-close-btn"
        >
          <Feather name="x" size={20} color="#111111" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
