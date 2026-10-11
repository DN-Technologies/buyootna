import { Text, View } from 'react-native';

import ActivityFilterPills, {
  ActivityFilterType,
  FilterPill,
} from '@/features/individual/components/activity/ActivityFilterPills';
import FreeQuotaBanner from '@/features/individual/components/activity/ads/FreeQuotaBanner';
import SubscriptionSlotsRow from '@/features/individual/components/activity/ads/SubscriptionSlotsRow';
import { SubscriptionInfo } from '@/shared/hooks/properties/useMyActivity';

interface ActivityListHeaderProps {
  filterPills: FilterPill[];
  activeFilterId: ActivityFilterType;
  onFilterChange: (id: ActivityFilterType) => void;
  hasSubscription: boolean;
  subscription: SubscriptionInfo | undefined;
  freeAdsRemaining: number;
  onPromoPress: () => void;
}

export default function ActivityListHeader({
  filterPills,
  activeFilterId,
  onFilterChange,
  hasSubscription,
  subscription,
  freeAdsRemaining,
  onPromoPress,
}: ActivityListHeaderProps) {
  return (
    <View style={{ width: '100%' }}>
      {/* --- Filter Pills --- */}
      <ActivityFilterPills
        filterPills={filterPills}
        activeFilterId={activeFilterId}
        onFilterChange={onFilterChange}
      />

      {/* --- Header Notice when Archived is active --- */}
      {activeFilterId === 'ARCHIVED' && (
        <View className="mb-3 mt-1 w-full">
          <Text
            className="font-cairo text-[14px] leading-[20px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            اعلانات منتهية بعد مدة النشر (30يوم)
          </Text>
        </View>
      )}

      {/* --- Dynamic Quota Banner or Subscription Slots --- */}
      {activeFilterId !== 'ARCHIVED' &&
        (hasSubscription ? (
          <SubscriptionSlotsRow subscription={subscription} />
        ) : (
          <FreeQuotaBanner
            freeAdsRemaining={freeAdsRemaining}
            onPressAction={onPromoPress}
          />
        ))}
    </View>
  );
}
