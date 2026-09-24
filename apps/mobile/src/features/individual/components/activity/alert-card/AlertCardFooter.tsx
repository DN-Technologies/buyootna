import { I18nManager, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  formatCreatedDate,
  formatRelativeMatchTime,
} from '@/features/individual/utils/alertCard';

const isRTL = I18nManager.isRTL;

function BellOffIcon({
  size = 14,
  color = '#9C1E28',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.73 21a2 2 0 01-3.46 0M18.63 13A17.89 17.89 0 0118 8M6.26 6.26A5.86 5.86 0 006 8c0 7-3 9-3 9h14M1 1l22 22"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export interface AlertCardFooterProps {
  lastMatchedAt?: string | null;
  isActive: boolean;
  createdAt?: string | null;
  showCancelAction?: boolean;
  onCancelPress?: () => void;
}

// Bottom row:
// Mode 1 (standard): [Status text] (Left) <---> [Green Dot + Relative Time] (Right)
// Mode 2 (cancel action): [إلغاء التنبيه] (Left) <---> [تم الإنشاء في: ...] (Right)
export default function AlertCardFooter({
  lastMatchedAt,
  isActive,
  createdAt,
  showCancelAction,
  onCancelPress,
}: AlertCardFooterProps) {
  if (showCancelAction && onCancelPress) {
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
        {/* Right Element: Created Date */}
        <View className="flex-row items-center">
          <Text
            className="font-cairo-medium text-[13px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            تم الإنشاء في: {formatCreatedDate(createdAt)}
          </Text>
        </View>

        {/* Left Element: Cancel Alert Action */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onCancelPress}
          testID="cancel-alert-footer-btn"
          className="flex-row items-center gap-1.5"
        >
          <Text className="font-cairo-semibold text-[13px] text-[#9C1E28]">
            إلغاء التنبيه
          </Text>
          <BellOffIcon size={14} color="#9C1E28" />
        </TouchableOpacity>
      </View>
    );
  }

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
