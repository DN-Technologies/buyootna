import { I18nManager, Text, View } from 'react-native';

import { formatRelativeMatchTime } from '@/features/individual/utils/alertCard';

const isRTL = I18nManager.isRTL;

export interface AlertCardFooterProps {
  lastMatchedAt?: string | null;
  isActive: boolean;
}

// Bottom row: [Status text] (Left) <---> [Green Dot + Relative Time] (Right)
export default function AlertCardFooter({
  lastMatchedAt,
  isActive,
}: AlertCardFooterProps) {
  return (
    <View
      style={{
        borderTopWidth: 0.5,
        borderTopColor: '#D7D7D7',
        marginTop: 12,
        paddingHorizontal: 16,
        height: 48,
        flexDirection: isRTL ? 'row' : 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Right Element: Relative Match Time + Active Green Dot */}
      <View className="flex-row items-center gap-1.5">
        <View
          className={`h-2 w-2 rounded-full ${
            lastMatchedAt ? 'bg-[#018B1B]' : 'bg-[#D7D7D7]'
          }`}
        />
        <Text className="font-cairo-medium text-[13px] text-[#111111]">
          {formatRelativeMatchTime(lastMatchedAt)}
        </Text>
      </View>

      {/* Left Element: Status Label */}
      <Text
        className={`font-cairo-medium text-[13px] ${
          isActive ? 'text-[#15304D]' : 'text-[#9C1E28]'
        }`}
      >
        {isActive ? 'تم تفعيل التنبيهات' : 'تم ايقاف التنبيهات'}
      </Text>
    </View>
  );
}
