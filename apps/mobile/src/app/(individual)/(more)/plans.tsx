import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import OfficePlanCard from '@/features/individual/components/plans/OfficePlanCard';
import PlanCard from '@/features/individual/components/plans/PlanCard';
import PlansHeader from '@/features/individual/components/plans/PlansHeader';
import PlansPromoBanner from '@/features/individual/components/plans/PlansPromoBanner';
import PlansWalletSection from '@/features/individual/components/plans/PlansWalletSection';
import { usePlans } from '@/features/individual/hooks/usePlans';
import PlanCardSkeleton from '@/shared/components/skeletons/PlanCardSkeleton';

WebBrowser.maybeCompleteAuthSession();

export default function PlansScreen() {
  const router = useRouter();
  const {
    isOffice,
    officePlans,
    officeSelection,
    selectOfficePackage,
    buyOfficePackage,
    tiers,
    wallet,
    promo,
    isLoading,
    isProcessing,
    selectOption,
    buyPlan,
  } = usePlans();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <PlansHeader onBack={() => router.back()} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="gap-6 px-5 py-6">
            {[1, 2].map((key) => (
              <PlanCardSkeleton key={key} />
            ))}
          </View>
        ) : (
          <View className="px-5 py-6">
            {promo && <PlansPromoBanner promo={promo} />}
            <PlansWalletSection wallet={wallet} />

            {isOffice ? (
              <View className="gap-6">
                {officePlans.map((plan) => (
                  <OfficePlanCard
                    key={plan.id}
                    plan={plan}
                    selectedPackageId={officeSelection[plan.id]}
                    onSelectPackage={(packageId) =>
                      selectOfficePackage(plan.id, packageId)
                    }
                    onBuy={(packageId) => buyOfficePackage(plan.slug, packageId)}
                  />
                ))}
              </View>
            ) : (
            <View className="gap-6">
              {tiers.map((tier) => (
                <PlanCard
                  key={tier.id}
                  title={tier.title}
                  features={tier.features}
                  options={tier.options}
                  selectedOptionId={tier.selectedOption.id}
                  recommended={tier.recommended}
                  isProcessing={isProcessing === tier.id}
                  onSelectOption={(optionId) => selectOption(tier.id, optionId)}
                  onBuy={() => buyPlan(tier.id, tier.selectedOption)}
                />
              ))}
            </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
