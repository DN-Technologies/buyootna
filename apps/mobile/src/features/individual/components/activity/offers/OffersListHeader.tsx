import { Text, View } from 'react-native';

import ActivityFilterPills, {
  FilterPill,
} from '@/features/individual/components/activity/ActivityFilterPills';
import type { MyRequestStatus } from '@/features/individual/components/activity/offers/requestStatus';

interface OffersListHeaderProps {
  pills: FilterPill<MyRequestStatus>[];
  activeStatus: MyRequestStatus;
  onStatusChange: (status: MyRequestStatus) => void;
}

/** Status pills of عروضي (with counts), and the rejected-requests note. */
export default function OffersListHeader({
  pills,
  activeStatus,
  onStatusChange,
}: OffersListHeaderProps) {
  return (
    <View style={{ width: '100%' }}>
      <ActivityFilterPills
        filterPills={pills}
        activeFilterId={activeStatus}
        onFilterChange={onStatusChange}
        variant="tag"
      />

      {activeStatus === 'rejected' && (
        <Text
          className="mb-[15px] font-cairo text-[14px] text-[#111111]"
          style={{ writingDirection: 'rtl', letterSpacing: -0.408 }}
        >
          الطلبات المرفوضة تختفي بعد 30 يوم
        </Text>
      )}
    </View>
  );
}
