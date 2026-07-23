import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

export default function PaymentCallbackScreen() {
  const router = useRouter();
  const { status } = useLocalSearchParams<{ status?: string; invoiceId?: string }>();

  useEffect(() => {
    WebBrowser.dismissBrowser();

    if (!status) return;

    if (status === 'success') {
      Alert.alert('نجاح', 'تمت عملية الدفع وتفعيل الباقة بنجاح!', [
        {
          text: 'موافق',
          onPress: () => router.replace('/(more)/plans'),
        },
      ]);
    } else {
      Alert.alert('خطأ', 'فشلت عملية الدفع أو تم إلغاؤها.', [
        {
          text: 'موافق',
          onPress: () => router.replace('/(more)/plans'),
        },
      ]);
    }
  }, [router, status]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#15304D" />
      <Text className="font-cairo-medium mt-4 text-base text-gray-600">
        جاري جلب تفاصيل الدفع...
      </Text>
    </View>
  );
}
