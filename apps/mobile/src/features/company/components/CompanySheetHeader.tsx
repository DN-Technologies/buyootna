import { Text, TouchableOpacity, View } from 'react-native';

import { RequestCloseIcon } from '@/assets/icons/activity';

interface CompanySheetHeaderProps {
  title: string;
  onClose: () => void;
}

// Title row of the company bottom sheets (Figma 4410:166541 / 167920 /
// 167947): the title on the right, the close button on the left
export default function CompanySheetHeader({
  title,
  onClose,
}: CompanySheetHeaderProps) {
  return (
    <View className="flex-row items-center justify-between py-[6px] pe-[10px] ps-4">
      <Text
        className="flex-1 font-cairo-semibold text-[18px] leading-[24px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        {title}
      </Text>
      <TouchableOpacity
        testID="company-sheet-close"
        accessibilityLabel="إغلاق"
        onPress={onClose}
        className="h-8 w-8 items-center justify-center rounded-full"
      >
        <RequestCloseIcon />
      </TouchableOpacity>
    </View>
  );
}
