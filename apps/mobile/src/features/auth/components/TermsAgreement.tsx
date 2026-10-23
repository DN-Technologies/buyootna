import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import { useTermsAgreement } from '@/features/auth/terms';

/**
 * The terms checkbox above the sign-up button (Guideline 1.2): «شروط
 * الاستخدام و سياسة الخصوصية», each opening its page.
 */
export function TermsAgreement() {
  const router = useRouter();
  const accepted = useTermsAgreement((s) => s.accepted);
  const setAccepted = useTermsAgreement((s) => s.setAccepted);

  return (
    <View className="mb-4 w-full flex-row items-center">
      <TouchableOpacity
        testID="terms-agreement-checkbox"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
        activeOpacity={0.7}
        onPress={() => setAccepted(!accepted)}
        className="mr-2 p-1"
      >
        <View
          className={`h-5 w-5 rounded border-[1.5px] ${
            accepted ? 'border-primary bg-primary' : 'border-[#6B6A6A]'
          } items-center justify-center`}
        >
          {accepted && <Feather name="check" size={14} color="white" />}
        </View>
      </TouchableOpacity>
      {/* Hugs the box, so it starts on the right (RTL) */}
      <Text
        className="shrink font-cairo text-[12px] leading-[20px] text-[#6B6A6A]"
        style={{ writingDirection: 'rtl' }}
      >
        <Text
          testID="terms-agreement-terms-link"
          className="font-cairo-semibold text-primary"
          onPress={() => router.push('/terms')}
        >
          شروط الاستخدام
        </Text>{' '}
        و{' '}
        <Text
          className="font-cairo-semibold text-primary"
          onPress={() => router.push('/privacy')}
        >
          سياسة الخصوصية
        </Text>
      </Text>
    </View>
  );
}
