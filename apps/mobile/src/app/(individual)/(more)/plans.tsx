import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { paymentsService } from '@/shared/api/payments.service';
import { plansService } from '@/shared/api/plans.service';
import { SafeLinearGradient as LinearGradient } from '@/shared/components/SafeLinearGradient';
import PlanCardSkeleton from '@/shared/components/skeletons/PlanCardSkeleton';
import { showAlert } from '@/shared/utils/alert';

WebBrowser.maybeCompleteAuthSession();

export interface PlanOption {
  id: string;
  slug: string;
  label: string;
  price: string;
}

const BASIC_FEATURES = [
  'مدة النشر 30 يوم.',
  'حتى 5 صورة للعقار.',
  'ظهور في نتائج البحث.',
  'تواصل مباشر مع المهتمين.',
];

const BASIC_OPTIONS: PlanOption[] = [
  {
    id: 'basic-2',
    slug: 'regular',
    label: 'باقة 2 اعلان',
    price: '10 د.ك',
  },
  {
    id: 'basic-5',
    slug: 'regular',
    label: 'باقة 5 اعلانات',
    price: '22.5 د.ك',
  },
];

const GOLD_FEATURES = [
  'تمييز الاعلانات.',
  'حتى 15 صورة للعقار.',
  'مدة النشر 30 يوم.',
  'ظهور في أعلى نتائج البحث.',
  'اولوية الظهور في البحث الجغرافي.',
];

const GOLD_OPTIONS: PlanOption[] = [
  {
    id: 'gold-1',
    slug: 'gold',
    label: 'باقة 1 اعلان',
    price: '12 د.ك',
  },
  {
    id: 'gold-5',
    slug: 'gold',
    label: 'باقة 5 اعلانات',
    price: '50 د.ك',
  },
];

async function fetchPlansData() {
  const [plansRes, walletRes] = await Promise.all([
    plansService.getPlans().catch(() => []),
    plansService.getWallet().catch(() => ({ freeAdsRemaining: 0, slots: [] })),
  ]);

  return { plans: plansRes, wallet: walletRes };
}

function PlanOptionItem({
  option,
  isSelected,
  onSelect,
}: {
  option: PlanOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onSelect}
      className={`flex-1 flex-row items-center gap-2 rounded-lg p-3 ${
        isSelected
          ? 'border border-[#15304D] bg-[#F5F7F9]'
          : 'border border-transparent bg-[#F5F7F9]'
      }`}
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded-full ${
          isSelected ? 'border-2 border-[#15304D]' : 'border border-[#D7D7D7]'
        }`}
      >
        {isSelected && (
          <View className="h-2.5 w-2.5 rounded-full bg-[#15304D]" />
        )}
      </View>
      <View className='items-start'>
        <Text className="font-cairo-medium text-sm text-[#111111]">
          {option.label}
        </Text>
        <Text className="font-cairo-bold text-base text-[#111111]">
          {option.price}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function PlansScreen() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [selectedBasicOptionId, setSelectedBasicOptionId] =
    useState<string>('basic-2');
  const [selectedGoldOptionId, setSelectedGoldOptionId] =
    useState<string>('gold-1');

  const {
    data = { plans: [], wallet: { freeAdsRemaining: 0, slots: [] } },
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlansData,
  });
  const { plans, wallet } = data;

  const handleBuyPlan = async (tier: 'basic' | 'gold', option: PlanOption) => {
    if (isProcessing) return;

    setIsProcessing(tier);
    try {
      const targetSlug =
        plans.find(
          (p) =>
            p.slug === option.slug ||
            (tier === 'basic' && (p.slug === 'regular' || p.slug === 'basic')) ||
            (tier === 'gold' && p.slug === 'gold'),
        )?.slug || option.slug;

      const appRedirectUrl = Linking.createURL('payment-callback');
      const charge = await paymentsService.createCharge(
        targetSlug,
        appRedirectUrl,
      );

      if (charge.status === 'PAID') {
        showAlert('نجاح', 'تم تفعيل الباقة بنجاح!');
        refetch();
        return;
      }

      if (!charge.checkoutUrl) {
        throw new Error('لم يتم استلام رابط الدفع من بوابة الدفع.');
      }

      await WebBrowser.openBrowserAsync(charge.checkoutUrl);
    } catch (error: any) {
      console.error('Payment Error:', error);
      showAlert(
        'خطأ',
        error.response?.data?.message ||
          error.message ||
          'حدث خطأ أثناء معالجة الدفع.',
      );
    } finally {
      setIsProcessing(null);
    }
  };

  const selectedBasicOption =
    BASIC_OPTIONS.find((o) => o.id === selectedBasicOptionId) ||
    BASIC_OPTIONS[0];
  const selectedGoldOption =
    GOLD_OPTIONS.find((o) => o.id === selectedGoldOptionId) || GOLD_OPTIONS[0];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-8"
        >
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-[18px] leading-[26px] text-[#111111]">
          الباقات
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="gap-6 px-5 py-6">
            {[1, 2].map((key) => (
              <PlanCardSkeleton key={key} />
            ))}
          </View>
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

            {/* Plan Cards Container */}
            <View className="gap-6">
              {/* 1. Basic Plan Card */}
              <View className="rounded-2xl border border-[#ECECEC] bg-white p-5">
                <Text className="font-cairo-bold text-[17px] leading-[22px] text-[#111111]" 
                  style={{ writingDirection: "rtl" }}
                >
                  الباقة الاساسية
                </Text>

                <View className="my-3 h-[1px] bg-[#ECECEC]" />

                {/* Features List */}
                <View className="mb-6 gap-2">
                  {BASIC_FEATURES.map((feat, idx) => (
                    <View key={idx} className="flex-row items-center gap-2">
                      <Feather name="check" size={16} color="#018B1B" />
                      <Text className="font-cairo text-sm leading-[22px] text-[#111111]">
                        {feat}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Package Options Grid */}
                <View className="flex-row gap-2">
                  {BASIC_OPTIONS.map((opt) => (
                    <PlanOptionItem
                      key={opt.id}
                      option={opt}
                      isSelected={selectedBasicOptionId === opt.id}
                      onSelect={() => setSelectedBasicOptionId(opt.id)}
                    />
                  ))}
                </View>

                {/* Buy Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleBuyPlan('basic', selectedBasicOption)}
                  disabled={isProcessing === 'basic'}
                  className="mt-3.5 h-12 w-full items-center justify-center rounded-[24px] bg-[#15304D]"
                  style={{ opacity: isProcessing === 'basic' ? 0.6 : 1 }}
                >
                  <Text className="font-cairo-semibold leading-[22px] text-sm text-white">
                    {isProcessing === 'basic' ? 'جاري التحميل...' : 'اشتر الان'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 2. Golden Plan Card */}
              <View className="relative mt-2 rounded-2xl border border-[#D06400] bg-white p-5">
                {/* Centered Top Recommended Badge */}
                <View className="absolute -top-[14px] left-0 right-0 items-center">
                  <LinearGradient
                    colors={['#FF8D28', '#FACC15']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 22,
                      paddingHorizontal: 16,
                      paddingVertical: 5,
                      height: 28,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text className="font-cairo-semibold leading-[18px] text-xs text-[#111111]">
                      موصى به
                    </Text>
                  </LinearGradient>
                </View>

                <Text className="font-cairo-bold text-[17px] leading-[22px] text-[#111111]"
                  style={{ writingDirection: "rtl" }}
                >
                  الباقة الذهبية
                </Text>

                <View className="my-3 h-[1px] bg-[#ECECEC]" />

                {/* Features List */}
                <View className="mb-6 gap-2">
                  {GOLD_FEATURES.map((feat, idx) => (
                    <View key={idx} className="flex-row items-center gap-2">
                      <Feather name="check" size={16} color="#018B1B" />
                      <Text className="font-cairo text-sm leading-[22px] text-[#111111]">
                        {feat}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Package Options Grid */}
                <View className="flex-row gap-2">
                  {GOLD_OPTIONS.map((opt) => (
                    <PlanOptionItem
                      key={opt.id}
                      option={opt}
                      isSelected={selectedGoldOptionId === opt.id}
                      onSelect={() => setSelectedGoldOptionId(opt.id)}
                    />
                  ))}
                </View>

                {/* Buy Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleBuyPlan('gold', selectedGoldOption)}
                  disabled={isProcessing === 'gold'}
                  className="mt-3.5 h-12 w-full items-center justify-center rounded-[24px] bg-[#15304D]"
                  style={{ opacity: isProcessing === 'gold' ? 0.6 : 1 }}
                >
                  <Text className="font-cairo-semibold leading-[22px] text-sm text-white">
                    {isProcessing === 'gold' ? 'جاري التحميل...' : 'اشتر الان'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
