import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import {
  BoxTextInput,
  INPUT_BOX_CLASS,
} from '@/shared/components/add-listing/FormField';
import { toWesternDigits } from '@/shared/utils/arabicNumerals';

interface PhoneInputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  testID?: string;
}

/** A Kuwait number with its +965 box; the label comes from the toggle row. */
export default function PhoneInputField({
  value,
  onChangeText,
  testID,
}: PhoneInputFieldProps) {
  return (
    <View className="w-full flex-row items-center" style={{ gap: 8 }}>
      <View className={INPUT_BOX_CLASS} style={{ flex: 1, width: undefined }}>
        <BoxTextInput
          testID={testID}
          placeholder="58094586"
          keyboardType="phone-pad"
          value={value}
          onChangeText={(text) => onChangeText(toWesternDigits(text))}
        />
      </View>
      <View
        className="h-[46px] flex-row items-center justify-center rounded-lg border border-[#ECECEC] bg-white px-3"
        style={{ gap: 8 }}
      >
        <Text className="font-cairo text-[14px] text-[#979797]">+965</Text>
        <Feather name="chevron-down" size={14} color="#111111" />
      </View>
    </View>
  );
}
