import { Feather } from '@expo/vector-icons';
import { Text, TextInput, View } from 'react-native';

interface PhoneInputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  required?: boolean;
}

export default function PhoneInputField({
  value,
  onChangeText,
  required = true,
}: PhoneInputFieldProps) {
  return (
    <View className="mb-6 w-full">
      <Text
        className="mb-1 font-cairo-medium text-sm text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        رقم الهاتف {required && <Text className="text-red-500">*</Text>}
      </Text>
      <View
        className="h-[40px] flex-row items-center gap-2"
        style={{ gap: 8 }}
      >
        {/* Phone Input */}
        <View
          className="h-[40px] flex-1 flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-4 py-3"
          style={{ height: 40, flex: 1 }}
        >
          <TextInput
            className="h-6 flex-1 text-right font-cairo-semibold text-[#111111]"
            style={{ flex: 1, textAlign: 'right' }}
            placeholder="58094586"
            placeholderTextColor="#979797"
            keyboardType="phone-pad"
            value={value}
            onChangeText={onChangeText}
          />
        </View>
        {/* Country Code */}
        <View
          className="h-[40px] flex-row items-center justify-center rounded-md border border-[#ECECEC] bg-white px-3"
          style={{ height: 40 }}
        >
          <Feather
            name="chevron-down"
            size={16}
            color="#64748B"
            className="mr-1"
          />
          <Text className="font-cairo-semibold text-[#111111]">+965</Text>
        </View>

      </View>
    </View>
  );
}
