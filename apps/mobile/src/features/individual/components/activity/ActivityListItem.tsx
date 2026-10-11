import ActiveAdCard from '@/features/individual/components/activity/ads/ActiveAdCard';
import { ActivityFilterType } from '@/features/individual/components/activity/ActivityFilterPills';
import ArchivedAdCard from '@/features/individual/components/activity/ads/ArchivedAdCard';
import DraftAdCard from '@/features/individual/components/activity/ads/DraftAdCard';
import { ActivityItem } from '@/shared/hooks/useMyActivity';

interface ActivityListItemProps {
  property: ActivityItem;
  activeFilterId: ActivityFilterType;
  onDeletePress: (propertyId: string) => void;
  onPublishDraftPress: (property: ActivityItem) => void;
  // Opens an active / hidden / featured ad's details sheet
  onOpenAdPress: (property: ActivityItem) => void;
  // Opens an archived ad's page
  onOpenPress: (property: ActivityItem) => void;
}

export default function ActivityListItem({
  property,
  activeFilterId,
  onDeletePress,
  onPublishDraftPress,
  onOpenAdPress,
  onOpenPress,
}: ActivityListItemProps) {
  if (property.status === 'DRAFT') {
    return (
      <DraftAdCard
        property={property}
        onPublishPress={() => onPublishDraftPress(property)}
        onDeletePress={() => onDeletePress(property.id)}
      />
    );
  }

  if (
    property.status === 'EXPIRED' ||
    property.status === 'CLOSED' ||
    activeFilterId === 'ARCHIVED'
  ) {
    return (
      <ArchivedAdCard
        property={property}
        onPress={() => onOpenPress(property)}
      />
    );
  }

  return (
    <ActiveAdCard
      property={property}
      onPress={() => onOpenAdPress(property)}
    />
  );
}
