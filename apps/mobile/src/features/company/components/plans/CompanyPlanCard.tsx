import { Image } from 'expo-image';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import type { CompanyPlan } from '@/shared/api/companySubscriptions.service';
import { SafeLinearGradient as LinearGradient } from '@/shared/components/ui/SafeLinearGradient';

interface CompanyPlanCardProps {
  plan: CompanyPlan;
  // The plan the company is subscribed to now: tagged, and not buyable again
  isCurrent: boolean;
  isProcessing: boolean;
  disabled: boolean;
  // False on iOS, where plans are shown but not sold: no price, no button
  purchasable: boolean;
  onSubscribe: (plan: CompanyPlan) => void;
}

/** One subscription plan: its length, price, what it includes and the CTA. */
export default function CompanyPlanCard({
  plan,
  isCurrent,
  isProcessing,
  disabled,
  purchasable,
  onSubscribe,
}: CompanyPlanCardProps) {
  const highlighted = !!plan.badge;
  const canSubscribe = !isCurrent && !disabled;

  return (
    <View
      testID={`company-plan-${plan.slug}`}
      className={`w-full justify-between rounded-xl border bg-white p-6 ${
        purchasable ? 'min-h-[390px]' : ''
      } ${highlighted ? 'border-[#D06400]' : 'border-[#ECECEC]'}`}
      style={{ gap: 16 }}
    >
      {/* e.g. "الأكثر طلبا", centred on the top border */}
      {highlighted && (
        <View className="absolute -top-[15px] left-0 right-0 items-center">
          <LinearGradient
            colors={['#FF8D28', '#FACC15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 22, paddingHorizontal: 16, paddingVertical: 6 }}
          >
            <Text className="font-cairo-semibold text-xs text-[#111111]">
              {plan.badge}
            </Text>
          </LinearGradient>
        </View>
      )}

      <View style={{ gap: 12 }}>
        <View className="flex-row items-start" style={{ gap: 8 }}>
          <View className="flex-1 items-start">
            <Text
              className="font-cairo-semibold text-base leading-[22px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              {plan.name}
            </Text>
            {purchasable && (
              <Text
                className="font-cairo-bold text-xl text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {plan.price} دينار كويتي
              </Text>
            )}
          </View>
          {isCurrent && (
            <View
              testID="current-plan-tag"
              className="rounded-bl-[10px] rounded-tl-[10px] rounded-tr-lg bg-[#FBC817] px-2 py-1"
            >
              <Text className="font-cairo text-xs text-[#111111]">
                باقتك الحالية
              </Text>
            </View>
          )}
        </View>

        <View className="h-px w-full bg-[#ECECEC]" />

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
                className="flex-1 font-cairo text-sm leading-[21px] text-[#1C1D1F]"
                style={{ writingDirection: 'rtl' }}
              >
                {feature.trim()}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {purchasable && (
        <TouchableOpacity
          testID={`subscribe-${plan.slug}`}
          activeOpacity={0.85}
          disabled={!canSubscribe}
          onPress={() => onSubscribe(plan)}
          className={`h-12 w-full items-center justify-center rounded-full ${
            isCurrent ? 'bg-[#A6A6A6]' : 'bg-[#15304D]'
          }`}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              className="font-cairo-semibold text-sm text-white"
              style={{ letterSpacing: 0.28 }}
            >
              اشترك الان
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
