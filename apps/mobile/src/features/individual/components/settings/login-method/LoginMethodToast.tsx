import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';

interface LoginMethodToastProps {
  kind: 'success' | 'warning';
  message: string;
  // Inside the sheet (part of its layout) instead of floating over the screen
  inline?: boolean;
}

// The two toasts of the طريقة تسجيل الدخول flow: saved (green) and
// "verify the phone first" (amber)
export default function LoginMethodToast({
  kind,
  message,
  inline = false,
}: LoginMethodToastProps) {
  const success = kind === 'success';
  return (
    <View
      testID={`login-method-toast-${kind}`}
      style={{ elevation: 5 }}
      className={`${
        inline ? 'mb-2' : 'absolute left-5 right-5 top-14 z-[999]'
      } flex-row items-center gap-2.5 rounded-xl border bg-white px-4 py-3 shadow-lg ${
        success ? 'border-[#33D679]' : 'border-[#FF8D28]'
      }`}
    >
      {success ? (
        <Image
          source={require('@/assets/icons/success-icon.svg')}
          style={{ width: 24, height: 24 }}
        />
      ) : (
        <Feather name="alert-circle" size={20} color="#FF8D28" />
      )}
      <Text
        className="flex-1 font-cairo-medium text-[13px] leading-[20px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        {message}
      </Text>
    </View>
  );
}
