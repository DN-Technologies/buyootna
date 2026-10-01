import { Text, View } from 'react-native';

import { LoginIcon } from '@/assets/icons/settings';

export default function LoginMethodHeader() {
  return (
    <View className="items-center pt-2">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-[#F9FAFE]">
        <LoginIcon size={26} color="#15304D" />
      </View>
      <Text className="mb-4 font-cairo-semibold text-[18px] text-[#111111]">
        طريقة تسجيل الدخول
      </Text>
    </View>
  );
}
