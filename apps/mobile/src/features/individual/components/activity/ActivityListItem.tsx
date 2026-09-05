import ActiveAdCard from '@/features/individual/components/activity/ActiveAdCard';
import { ActivityFilterType } from '@/features/individual/components/activity/ActivityFilterPills';
import ArchivedAdCard from '@/features/individual/components/activity/ArchivedAdCard';
import DraftAdCard from '@/features/individual/components/activity/DraftAdCard';
import { ActivityItem } from '@/features/individual/hooks/useMyActivity';

interface ActivityListItemProps {
  property: ActivityItem;
  activeFilterId: ActivityFilterType;
  onEditPress: (propertyId: string) => void;
  onFeaturePress: (propertyId: string) => void;
  onDeletePress: (propertyId: string) => void;
  onPublishDraftPress: (property: ActivityItem) => void;
  onArchivedPress: (propertyId: string) => void;
}

export default function ActivityListItem({
  property,
  activeFilterId,
  onEditPress,
  onFeaturePress,
  onDeletePress,
  onPublishDraftPress,
  onArchivedPress,
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
        onPress={() => onArchivedPress(property.id)}
      />
    );
  }

  return (
    <ActiveAdCard
      property={property}
      onEditPress={onEditPress}
      onFeaturePress={onFeaturePress}
      onDeletePress={onDeletePress}
    />
  );
}
