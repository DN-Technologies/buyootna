import { Text, TouchableOpacity, View } from 'react-native';

import { SearchIcon } from '@/assets/icons/company-add';

interface InvoiceClientSearchProps {
  onPress: () => void;
}

// "ابحث عن عميل..." pill under the header of step 1 (Figma 4410:167377):
// opens the sheet of clients whose requests this company accepted
export default function InvoiceClientSearch({
  onPress,
}: InvoiceClientSearchProps) {
  return (
    <View className="h-[42px] justify-center px-4">
      <TouchableOpacity
        testID="invoice-client-picker-trigger"
        activeOpacity={0.7}
        onPress={onPress}
        className="flex-row items-center gap-[6px] rounded-full border border-[#ECECEC] bg-[#F9FAFE] px-3 py-[9px]"
      >
        <SearchIcon />
        <Text
          numberOfLines={1}
          className="flex-1 font-cairo text-[13px] leading-[16px] text-[#989898]"
          style={{ writingDirection: 'rtl' }}
        >
          ابحث عن عميل...
        </Text>
      </TouchableOpacity>
    </View>
  );
}
