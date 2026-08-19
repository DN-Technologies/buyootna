import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import apiClient from '@/shared/api/api';
import BalanceSummarySkeleton from '@/shared/components/skeletons/BalanceSummarySkeleton';
import ListRowSkeleton from '@/shared/components/skeletons/ListRowSkeleton';
import { useAuthStore } from '@/shared/store/useAuthStore';

interface HistoryItem {
  id: string;
  displayId: string;
  planName: string;
  planSlug: string;
  status: 'ACTIVE' | 'EXPIRED';
  dateText: string;
  createdAt: string;
  adsRemaining: number;
}

interface WalletData {
  freeAdsRemaining: number;
  balanceCounts: {
    gold: number;
    silver: number;
    regular: number;
  };
  history: HistoryItem[];
}

const FALLBACK_WALLET: WalletData = {
  freeAdsRemaining: 0,
  balanceCounts: { gold: 0, silver: 0, regular: 0 },
  history: [],
};

async function fetchWallet(): Promise<WalletData> {
  try {
    const res = await apiClient.get('/plans/wallet');
    return {
      freeAdsRemaining: res.data?.freeAdsRemaining ?? 0,
      balanceCounts: res.data?.balanceCounts ?? {
        gold: 0,
        silver: 0,
        regular: 0,
      },
      history: res.data?.history ?? [],
    };
  } catch (e) {
    console.log('Error fetching wallet:', e);
    return FALLBACK_WALLET;
  }
}

export default function AccountBalanceScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const {
    data: wallet = FALLBACK_WALLET,
    isLoading,
    isRefetching: refreshing,
    refetch: onRefresh,
  } = useQuery({
    queryKey: ['wallet'],
    queryFn: fetchWallet,
    enabled: !!user?.id,
  });

  const historyList = wallet?.history ?? [];
  const hasHistory = historyList.length > 0;
  const previewHistory = historyList.slice(0, 3);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* 1. Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-8 w-8 items-center justify-center"
        >
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-lg text-[#111111]">
          رصيد الحساب
        </Text>
        <View className="w-8" />
      </View>

      {isLoading ? (
        <View className="pt-4">
          <View className="mx-5 h-4 w-56 self-center rounded bg-slate-100" />
          <View className="mt-4">
            <BalanceSummarySkeleton />
          </View>
          <View className="mt-6 px-5">
            <View className="mb-4 h-4 w-24 self-center rounded bg-slate-200" />
            {[1, 2, 3].map((key) => (
              <ListRowSkeleton key={key} showIcon={false} />
            ))}
          </View>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#15304D']}
            />
          }
        >
          {/* Subtitle Intro */}
          <Text
            className="mt-4 px-5 text-center font-cairo text-[14px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            تابع رصيد إعلاناتك واستخدام الباقات الحالية.
          </Text>

          {/* 2. Free Listing Promo Banner (if free ads available) */}
          {wallet.freeAdsRemaining > 0 && (
            <View className="mx-5 mt-4 rounded-[8px] border border-[#ECECEC] bg-white p-3">
              <View className="flex-row items-center justify-between">
                <View className="mr-3">
                  <ExpoImage
                    source={require('@/assets/icons/reviews/emojione_party-popper-icon.svg')}
                    style={{ width: 32, height: 32 }}
                    contentFit="contain"
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="font-cairo-semibold text-[14px] text-[#15304D]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    أعلن عن عقارك مجاناً
                  </Text>
                  <Text
                    className="mt-1.5 font-cairo text-[13px] leading-5 text-[#6B6A6A]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    متبقي لديك {wallet.freeAdsRemaining} إعلان مجاني جاهز للنشر
                    الآن. استغل الفرصة واجذب المشترين.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/add-listing')}
                className="mt-3"
              >
                <Text className="text-right font-cairo-bold text-[14px] text-[#15304D]">
                  أنشئ إعلانك المجاني الآن
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 3. Package Balance Cards (3 Columns: Gold, Silver, Regular) */}
          <View className="mx-5 mt-4 flex-row items-center gap-3">
            {/* Regular Card */}
            <View className="flex-1 rounded-[16px] bg-[#F8F9FA] p-4">
              <Text
                className="font-cairo-bold text-2xl text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {wallet?.balanceCounts?.regular ?? 0}
              </Text>
              <Text
                className="mt-1 font-cairo-semibold text-sm text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                عادي
              </Text>
            </View>

            {/* Silver Card */}
            <View className="flex-1 rounded-[16px] bg-[#F8F9FA] p-4">
              <Text
                className="font-cairo-bold text-2xl text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {wallet?.balanceCounts?.silver ?? 0}
              </Text>
              <Text
                className="mt-1 font-cairo-semibold text-sm text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                فضي
              </Text>
            </View>

            {/* Gold Card */}
            <View className="flex-1 rounded-[16px] bg-[#FF9F1C] p-4">
              <Text
                className="font-cairo-bold text-2xl text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {wallet?.balanceCounts?.gold ?? 0}
              </Text>
              <Text
                className="mt-1 font-cairo-semibold text-sm text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                ذهبي
              </Text>
            </View>
          </View>

          {/* 4. Ad History Section (if user has package history) */}
          {hasHistory && (
            <View className="mt-6 px-5">
              <View className="mb-4 flex-row items-center justify-between">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push('/package-history')}
                >
                  <Text className="font-cairo-semibold text-sm text-[#15304D]">
                    عرض الكل
                  </Text>
                </TouchableOpacity>
                <Text className="font-cairo-bold text-base text-[#111111]">
                  سجل الاعلانات
                </Text>
              </View>

              {previewHistory.map((item) => (
                <View
                  key={item.id}
                  className="mb-3 flex-row items-center justify-between rounded-2xl bg-[#F8F9FA] p-4"
                >
                  {/* Left: ID */}
                  <Text className="font-cairo text-xs text-[#94A3B8]">
                    {item.displayId}
                  </Text>

                  {/* Right: Title & Expiration */}
                  <View className="items-end">
                    <View className="flex-row items-center gap-2">
                      <Text className="font-cairo-semibold text-sm text-[#111111]">
                        {item.planName}
                      </Text>
                      <View
                        className={`h-2 w-2 rounded-full ${
                          item.status === 'ACTIVE'
                            ? 'bg-[#10B981]'
                            : 'bg-[#EF4444]'
                        }`}
                      />
                    </View>
                    <Text className="mt-1 font-cairo text-xs text-[#6B6A6A]">
                      {item.dateText}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* 5. Fixed Bottom Action Buttons */}
      {!isLoading && (
        <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 py-4">
          {hasHistory ? (
            <View className="gap-3">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/add-listing')}
                className="h-12 w-full items-center justify-center rounded-[24px] bg-[#15304D]"
              >
                <Text className="font-cairo-semibold text-sm text-white">
                  إضافة إعلان
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/plans')}
                className="h-12 w-full items-center justify-center rounded-[24px] border border-[#15304D] bg-white"
              >
                <Text className="font-cairo-semibold text-sm text-[#15304D]">
                  استعرض الباقات
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/plans')}
              className="h-[48px] w-full items-center justify-center rounded-[24px] bg-[#15304D]"
            >
              <Text className="font-cairo-semibold text-[14px] leading-[22px] text-white">
                استعرض الباقات
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
