import { Text, TouchableOpacity, View } from 'react-native';

import { BackChevronIcon, TrashOutlineIcon } from '@/assets/icons/activity';

interface RequestDetailsHeaderProps {
  onBack: () => void;
  // Shown (red trash, on the left) only when the request can be deleted
  onDelete?: () => void;
}

/** Figma "pages title": back arrow on the right, title centred, delete on the left. */
export default function RequestDetailsHeader({
  onBack,
  onDelete,
}: RequestDetailsHeaderProps) {
  return (
    <View className="h-[52px] flex-row items-center justify-between px-4 py-[6px]">
      <TouchableOpacity
        testID="request-details-back"
        accessibilityLabel="رجوع"
        onPress={onBack}
        activeOpacity={0.7}
        className="h-8 w-8 items-center justify-center"
      >
        {/* The asset points left; the RTL back arrow points right */}
        <View style={{ transform: [{ scaleX: -1 }] }}>
          <BackChevronIcon />
        </View>
      </TouchableOpacity>

      <Text
        className="flex-1 text-center font-cairo-semibold text-[18px] leading-[26px] text-[#111111]"
        numberOfLines={1}
      >
        تفاصيل العرض
      </Text>

      {onDelete ? (
        <TouchableOpacity
          testID="request-details-delete"
          accessibilityLabel="حذف الطلب"
          onPress={onDelete}
          activeOpacity={0.7}
          className="h-8 w-8 items-center justify-center"
        >
          <TrashOutlineIcon />
        </TouchableOpacity>
      ) : (
        <View className="h-8 w-8" />
      )}
    </View>
  );
}
