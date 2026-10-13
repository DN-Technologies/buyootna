import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import type { SubscribedPlan } from '@/shared/api/companySubscriptions.service';
import { SafeLinearGradient as LinearGradient } from '@/shared/components/ui/SafeLinearGradient';
import { formatArabicDate } from '@/shared/utils/helpers/property';

interface CurrentPlanCardProps {
  plan: SubscribedPlan;
  endsAt: string | null;
  // The plan ran out: tagged "منتهية", with browse/renew instead of details
  expired: boolean;
  // False on iOS: no renew button, since the app can't sell there
  canPurchase: boolean;
  isRenewing: boolean;
  onBrowsePlans: () => void;
  onRenew: () => void;
}

const GemBadge = () => (
  <LinearGradient
    colors={['#FF8D28', '#FACC15']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{
      width: 30,
      height: 30,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Image
      source={require('@/assets/icons/company-balance/gem.svg')}
      style={{ width: 17, height: 17 }}
      contentFit="contain"
    />
  </LinearGradient>
);

/** The plan the company is on (or was on), with what it includes. */
export default function CurrentPlanCard({
  plan,
  endsAt,
  expired,
  canPurchase,
  isRenewing,
  onBrowsePlans,
  onRenew,
}: CurrentPlanCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <View
      testID="balance-plan-card"
      className="w-full rounded-lg bg-[#F9FAFE] px-4 py-3"
      style={{ gap: 16 }}
    >
      <View className="flex-row items-start" style={{ gap: 12 }}>
        <GemBadge />
        <View className="flex-1 items-start">
          {!expired && (
            <Text className="font-cairo-medium text-xs leading-[17px] text-[#111111]">
              الباقة الحالية
            </Text>
          )}
          <Text
            className="font-cairo-bold text-base text-[#15304D]"
            style={{ writingDirection: 'rtl' }}
          >
            {plan.name}
          </Text>
          {endsAt && (
            <Text
              className="font-cairo-medium text-xs leading-[17px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              تاريخ الانتهاء: {formatArabicDate(endsAt)}
            </Text>
          )}
        </View>
        {expired ? (
          <View
            testID="balance-plan-expired-tag"
            className="h-5 items-center justify-center rounded-bl-lg rounded-tl-lg rounded-tr-lg bg-[#FFEBEB] px-2"
          >
            <Text className="font-cairo text-xs text-[#9C1E28]">منتهية</Text>
          </View>
        ) : // No prices where the app can't sell (iOS)
        canPurchase ? (
          <Text
            testID="balance-plan-price"
            className="font-cairo-bold text-lg text-[#15304D]"
          >
            {plan.price} د.ك
          </Text>
        ) : null}
      </View>

      {expired ? (
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <TouchableOpacity
            testID="balance-browse-plans"
            activeOpacity={0.85}
            onPress={onBrowsePlans}
            className="h-10 flex-1 items-center justify-center rounded-full bg-[#15304D]"
          >
            <Text
              className="font-cairo-semibold text-sm text-white"
              style={{ letterSpacing: 0.28 }}
            >
              استعرض الباقات
            </Text>
          </TouchableOpacity>
          {canPurchase && (
            <TouchableOpacity
              testID="balance-renew-plan"
              activeOpacity={0.85}
              disabled={isRenewing}
              onPress={onRenew}
              className="h-10 flex-1 items-center justify-center rounded-full border border-[#15304D]"
            >
              {isRenewing ? (
                <ActivityIndicator color="#15304D" />
              ) : (
                <Text
                  className="font-cairo-semibold text-sm text-[#15304D]"
                  style={{ letterSpacing: 0.28 }}
                >
                  تجديد الباقة
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          {open && (
            <View testID="balance-plan-features" style={{ gap: 12 }}>
              <View className="h-px w-full bg-[#A6A6A6]" />
              <View style={{ gap: 8 }}>
                {plan.features.map((feature) => (
                  <View
                    key={feature}
                    className="flex-row items-center"
                    style={{ gap: 8 }}
                  >
                    <Image
                      source={require('@/assets/icons/company-plan-check.svg')}
                      style={{ width: 16, height: 16 }}
                      contentFit="contain"
                    />
                    <Text
                      className="flex-1 font-cairo text-sm leading-[21px] text-[#111111]"
                      style={{ writingDirection: 'rtl' }}
                    >
                      {feature.trim()}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity
            testID="balance-plan-details-toggle"
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
            activeOpacity={0.7}
            onPress={() => setOpen((value) => !value)}
            className="h-8 flex-row items-center justify-center"
            style={{ gap: 4 }}
          >
            <Text className="font-cairo-bold text-sm text-[#111111]">
              تفاصيل
            </Text>
            <Feather
              name={open ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#111111"
            />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
