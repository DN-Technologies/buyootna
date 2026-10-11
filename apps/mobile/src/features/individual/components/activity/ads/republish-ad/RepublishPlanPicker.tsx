import { View } from 'react-native';

import type { RepublishPlanType } from './republishCredits';
import RepublishPlanOption from './RepublishPlanOption';

interface RepublishPlanPickerProps {
  featuredCount: number;
  regularCount: number;
  selected: RepublishPlanType;
  onSelect: (planType: RepublishPlanType) => void;
}

// Shown when the user has both kinds of credit
export default function RepublishPlanPicker({
  featuredCount,
  regularCount,
  selected,
  onSelect,
}: RepublishPlanPickerProps) {
  return (
    <View className="w-full flex-row gap-2">
      <RepublishPlanOption
        planType="REGULAR"
        title="إعلان عادي"
        balanceLabel={`رصيدك: ${regularCount} إعلانات`}
        isSelected={selected === 'REGULAR'}
        onPress={onSelect}
      />
      <RepublishPlanOption
        planType="FEATURED"
        title="إعلان مميز"
        balanceLabel={`رصيدك: ${featuredCount} إعلان`}
        isSelected={selected === 'FEATURED'}
        onPress={onSelect}
      />
    </View>
  );
}
