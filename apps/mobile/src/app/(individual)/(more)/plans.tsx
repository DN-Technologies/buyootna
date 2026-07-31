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

import { paymentsService } from '@/shared/api/payments.service';
import { plansService } from '@/shared/api/plans.service';

WebBrowser.maybeCompleteAuthSession();

export default function PlansScreen() {
  const router = useRouter();

  const [plans, setPlans] = useState<any[]>([]);
  const [wallet, setWallet] = useState<{ freeAdsRemaining: number; slots: any[] }>({
    freeAdsRemaining: 0,
    slots: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [plansRes, walletRes] = await Promise.all([
        plansService.getPlans(),
        plansService.getWallet().catch(() => ({ freeAdsRemaining: 0, slots: [] })),
      ]);

      const mapped = plansRes.map((plan) => ({
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
      setWallet(walletRes);
    } catch (e) {
      console.error('Failed to load plans or wallet:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyPlan = async (planSlug: string) => {
    if (isProcessing) return;

    setIsProcessing(planSlug);
    try {
      const appRedirectUrl = Linking.createURL('payment-callback');
      const charge = await paymentsService.createCharge(
        planSlug,
        appRedirectUrl,
      );

      if (charge.status === 'PAID') {
        Alert.alert('نجاح', 'تم تفعيل الباقة بنجاح!');
        fetchData();
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
      setIsProcessing(null);
    }
  };

  useEffect(() => {
    fetchData();
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
            {/* Wallet Section */}
            {(wallet.freeAdsRemaining > 0 || wallet.slots.length > 0) && (
              <View className="mb-6 rounded-2xl bg-[#F4F7FB] p-4 border border-[#DCE4EE]">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <Feather name="folder" size={20} color="#15304D" />
                    <Text className="font-cairo-bold text-base text-[#15304D]">
                      محفظتك الإعلانية
                    </Text>
                  </View>
                  <Text className="font-cairo-semibold text-xs text-[#6B6A6A]">
                    رصيد الإعلانات المتوفر
                  </Text>
                </View>

                {wallet.freeAdsRemaining > 0 && (
                  <View className="mb-2 flex-row items-center justify-between rounded-xl bg-white p-3 border border-gray-100">
                    <Text className="font-cairo-semibold text-sm text-[#111111]">
                      الإعلان المجاني الترحيبي
                    </Text>
                    <Text className="font-cairo-bold text-sm text-[#018B1B]">
                      متبقي 1 إعلان
                    </Text>
                  </View>
                )}

                {wallet.slots.map((slot) => (
                  <View
                    key={slot.id}
                    className="mb-2 flex-row items-center justify-between rounded-xl bg-white p-3 border border-gray-100"
                  >
                    <View className="flex-row items-center gap-2">
                      <View
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: slot.color || '#15304D' }}
                      />
                      <Text className="font-cairo-semibold text-sm text-[#111111]">
                        باقة {slot.planName}
                      </Text>
                    </View>
                    <Text className="font-cairo-bold text-sm text-[#15304D]">
                      متبقي {slot.adsRemaining} من {slot.maxActiveAds} إعلانات
                    </Text>
                  </View>
                ))}
              </View>
            )}
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
                    disabled={isProcessing === plan.id}
                    className="h-12 w-full items-center justify-center rounded-[24px]"
                    style={{
                      backgroundColor: '#15304D',
                      opacity: isProcessing === plan.id ? 0.6 : 1,
                    }}
                  >
                    <Text className="font-cairo-semibold text-[14px] text-white">
                      {isProcessing === plan.id ? 'جاري التحميل...' : 'اشتر الآن'}
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
