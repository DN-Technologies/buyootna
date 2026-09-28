import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { showAlert } from '@/shared/utils/alert';

export default function PaymentCallbackScreen() {
  const router = useRouter();
  const { status, purpose } = useLocalSearchParams<{
    status?: string;
    invoiceId?: string;
    purpose?: string;
  }>();

  useEffect(() => {
    WebBrowser.dismissBrowser();

    if (!status) return;

    // "Feature this ad" payments return to My Activity, plans to /plans
    const isFeature = purpose === 'feature';
    const returnTo = isFeature ? '/activity' : '/plans';

    if (status === 'success') {
      showAlert(
        'نجاح',
        isFeature
          ? 'تم الدفع وتمييز إعلانك بنجاح!'
          : 'تمت عملية الدفع وتفعيل الباقة بنجاح!',
        [
          {
            text: 'موافق',
            onPress: () => router.replace(returnTo),
          },
        ],
      );
    } else {
      showAlert('خطأ', 'فشلت عملية الدفع أو تم إلغاؤها.', [
        {
          text: 'موافق',
          onPress: () => router.replace(returnTo),
        },
      ]);
    }
  }, [router, status, purpose]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#15304D" />
      <Text className="font-cairo-medium mt-4 text-base text-gray-600">
        جاري جلب تفاصيل الدفع...
      </Text>
    </View>
  );
}
