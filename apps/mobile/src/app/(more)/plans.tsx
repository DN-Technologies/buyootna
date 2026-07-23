import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { paymentsService } from '@/core/api/payments.service';
import { plansService } from '@/core/api/plans.service';

WebBrowser.maybeCompleteAuthSession();

export default function PlansScreen() {
  const router = useRouter();

  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await plansService.getPlans();
      const mapped = response.map((plan) => ({
        id: plan.slug,
        name: plan.name,
        price: `${plan.price} دينار كويتي`,
        originalPrice: plan.originalPrice ? `${plan.originalPrice}` : undefined,
        discountText: plan.discountText || undefined,
        features: plan.features,
        color: plan.color || '#15304D',
        badge: plan.badge || '',
      }));
      setPlans(mapped);
    } catch (e) {
      console.error('Failed to load plans:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const parseQueryParams = (url: string) => {
    const params: Record<string, string> = {};
    const queryString = url.split('?')[1];
    if (queryString) {
      const pairs = queryString.split('&');
      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key && value) {
          params[decodeURIComponent(key)] = decodeURIComponent(value);
        }
      }
    }
    return params;
  };

  const handleBuyPlan = async (planSlug: string) => {
    if (planSlug === 'regular') {
      Alert.alert('تنبيه', 'أنت بالفعل مشترك في الباقة العادية المجانية.');
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const appRedirectUrl = Linking.createURL('payment-callback');
      const charge = await paymentsService.createCharge(
        planSlug,
        appRedirectUrl,
      );

      if (charge.status === 'PAID') {
        Alert.alert('نجاح', 'تم تفعيل الباقة بنجاح!');
        return;
      }

      if (!charge.checkoutUrl) {
        throw new Error('لم يتم استلام رابط الدفع من بوابة الدفع.');
      }

      await WebBrowser.openBrowserAsync(charge.checkoutUrl);
    } catch (error: any) {
      console.error('Payment Error:', error);
      Alert.alert(
        'خطأ',
        error.response?.data?.message ||
          error.message ||
          'حدث خطأ أثناء معالجة الدفع.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 px-5 py-4">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-8"
        >
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
          الباقات
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#15304D" className="py-20" />
        ) : (
          <View className="px-5 py-6">
            {/* Plan Cards */}
            <View className="gap-6">
              {plans.map((plan) => (
                <View
                  key={plan.id}
                  className={`relative rounded-2xl border bg-white p-5 shadow-sm shadow-gray-200/50 ${
                    plan.id === 'gold' ? 'border-[#D06400]' : 'border-[#ECECEC]'
                  }`}
                >
                  {/* Centered Top Badge */}
                  {plan.badge ? (
                    <View className="absolute -top-[14.5px] left-0 right-0 items-center">
                      <LinearGradient
                        colors={['#FF8D28', '#FACC15']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          borderRadius: 22,
                          paddingHorizontal: 16,
                          paddingVertical: 6,
                          height: 29,
                          width: 111,
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <Feather name="award" size={12} color="#111111" />
                        <Text className="font-cairo-semibold text-[12px] leading-[20px] text-[#111111]">
                          {plan.badge}
                        </Text>
                      </LinearGradient>
                    </View>
                  ) : null}

                  {/* Main Info */}
                  <View className="mt-2 items-start">
                    <Text className="mb-1 font-cairo-semibold text-base text-[#111111]">
                      {plan.name}
                    </Text>
                    <View className="mb-4 flex-row items-baseline gap-2">
                      <Text className="font-cairo-bold text-lg text-[#111111]">
                        {plan.price}
                      </Text>
                      {plan.originalPrice && (
                        <Text className="font-cairo text-lg text-[#6B6A6A] line-through">
                          {plan.originalPrice}
                        </Text>
                      )}
                      {plan.discountText && (
                        <Text className="font-cairo text-lg text-[#018B1B]">
                          {plan.discountText}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Divider */}
                  <View className="my-4 h-[1px] bg-gray-100" />

                  {/* Features List */}
                  <View className="mb-6 gap-2">
                    {plan.features.map((feat: string, idx: number) => (
                      <View key={idx} className="flex-row items-center gap-2">
                        <Feather name="check" size={16} color="#018B1B" />
                        <Text
                          className="flex-1 font-cairo text-sm text-[#111111]"
                          style={{ writingDirection: 'rtl' }}
                        >
                          {feat}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Buy Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleBuyPlan(plan.id)}
                    disabled={isProcessing}
                    className="h-12 w-full items-center justify-center rounded-[24px]"
                    style={{
                      backgroundColor: '#15304D',
                      opacity: isProcessing ? 0.6 : 1,
                    }}
                  >
                    <Text className="font-cairo-semibold text-[14px] text-white">
                      {isProcessing ? 'جاري التحميل...' : 'اشتر الآن'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
