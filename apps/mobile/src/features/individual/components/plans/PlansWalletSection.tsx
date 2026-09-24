import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { groupWalletSlots } from '@/features/individual/utils/planWallet';
import type { UserWallet } from '@/shared/api/plans.service';

export interface PlansWalletSectionProps {
  wallet: UserWallet;
}

export default function PlansWalletSection({
  wallet,
}: PlansWalletSectionProps) {
  if (wallet.freeAdsRemaining <= 0 && wallet.slots.length === 0) return null;

  return (
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

      {groupWalletSlots(wallet.slots).map((tier) => (
        <View
          key={tier.planSlug}
          className="mb-2 flex-row items-center justify-between rounded-xl bg-white p-3 border border-gray-100"
        >
          <View className="flex-row items-center gap-2">
            <View
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: tier.color || '#15304D' }}
            />
            <Text className="font-cairo-semibold text-sm text-[#111111]">
              باقة {tier.planName}
            </Text>
          </View>
          <Text className="font-cairo-bold text-sm text-[#15304D]">
            متبقي {tier.adsRemaining} من {tier.totalAds} إعلانات
          </Text>
        </View>
      ))}
    </View>
  );
}
