import { useEffect, useState } from 'react';

import type { ActivityItem } from '@/shared/hooks/properties/useMyActivity';

interface UseAdPreviewSwitchParams {
  property?: ActivityItem;
  // 'draft': the switch publishes it. 'active': the switch shows / hides it
  variant: 'draft' | 'active';
  onToggleVisibility?: (propertyId: string, hide: boolean) => void;
  onPublishPress?: (propertyId: string) => Promise<void>;
  // Called after a draft is published, to close the sheet
  onPublished: () => void;
}

/** The header switch: a draft's "published", an active ad's "visible". */
export function useAdPreviewSwitch({
  property,
  variant,
  onToggleVisibility,
  onPublishPress,
  onPublished,
}: UseAdPreviewSwitchParams) {
  const isActiveVariant = variant === 'active';
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    if (property) {
      setIsOn(isActiveVariant ? !property.isHidden : property.status === 'ACTIVE');
    }
  }, [property, isActiveVariant]);

  const toggle = async () => {
    if (!property) return;
    if (isActiveVariant) {
      setIsOn(!isOn);
      // On before the tap means the ad gets hidden
      onToggleVisibility?.(property.id, isOn);
    } else if (onPublishPress && !isOn) {
      try {
        await onPublishPress(property.id);
        onPublished();
      } catch {
        // Handled inside the parent callback
      }
    } else {
      setIsOn(!isOn);
    }
  };

  return { isOn, toggle };
}
