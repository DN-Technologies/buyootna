import ActiveAdCard from '@/features/individual/components/activity/ActiveAdCard';
import { ActivityFilterType } from '@/features/individual/components/activity/ActivityFilterPills';
import ArchivedAdCard from '@/features/individual/components/activity/ArchivedAdCard';
import DraftAdCard from '@/features/individual/components/activity/DraftAdCard';
import { ActivityItem } from '@/shared/hooks/useMyActivity';

interface ActivityListItemProps {
  property: ActivityItem;
  activeFilterId: ActivityFilterType;
  onEditPress: (propertyId: string) => void;
  onFeaturePress: (propertyId: string) => void;
  onDeletePress: (propertyId: string) => void;
  onPublishDraftPress: (property: ActivityItem) => void;
  // Opens the ad's details (active, hidden, featured or archived)
  onOpenPress: (property: ActivityItem) => void;
}

export default function ActivityListItem({
  property,
  activeFilterId,
  onEditPress,
  onFeaturePress,
  onDeletePress,
  onPublishDraftPress,
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
      onEditPress={onEditPress}
      onFeaturePress={onFeaturePress}
      onDeletePress={onDeletePress}
      onPress={() => onOpenPress(property)}
    />
  );
}
