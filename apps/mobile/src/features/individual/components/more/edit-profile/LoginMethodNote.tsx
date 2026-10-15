import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import type { LoginMethod } from '@/shared/api/settings.service';

const NOTE: Record<LoginMethod, string> = {
  PHONE:
    'طريقة تسجيل الدخول لديك: رقم الهاتف، لذلك الرقم مطلوب، والبريد الإلكتروني اختياري.',
  EMAIL:
    'طريقة تسجيل الدخول لديك: البريد الإلكتروني، لذلك البريد مطلوب، ورقم الهاتف اختياري.',
  BOTH: 'طريقة تسجيل الدخول لديك: البريد الإلكتروني أو رقم الهاتف، لذلك كلاهما مطلوب.',
};

// Above the fields: what signs in, and so which of email / phone is required
export default function LoginMethodNote({
  method,
  onChange,
}: {
  method: LoginMethod | null;
  onChange: () => void;
}) {
  if (!method) return null;
  return (
    <View
      testID="login-method-note"
      className="flex-row gap-2 rounded-xl border border-[#DCE6F2] bg-[#F5F8FC] px-3 py-2.5"
    >
      <Feather name="info" size={16} color="#15304D" style={{ marginTop: 2 }} />
      <View className="flex-1">
        <Text
          className="font-cairo text-xs leading-[20px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {NOTE[method]}
        </Text>
        <TouchableOpacity
          testID="login-method-note-settings"
          onPress={onChange}
          className="mt-0.5 self-start"
        >
          <Text className="font-cairo-semibold text-xs text-[#15304D] underline">
            يمكنك تغييرها من الإعدادات
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
