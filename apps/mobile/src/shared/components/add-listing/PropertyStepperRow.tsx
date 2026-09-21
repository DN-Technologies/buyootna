import { View } from 'react-native';

import StepperInput from '@/shared/components/filters/StepperInput';
import type { ListingType } from '@/shared/store/useListingStore';

interface PropertyStepperRowProps {
  listingType: ListingType;
  floors: number;
  onChangeFloors: (value: number) => void;
  baths: number;
  onChangeBaths: (value: number) => void;
  rooms: number;
  onChangeRooms: (value: number) => void;
}

export default function PropertyStepperRow({
  listingType,
  floors,
  onChangeFloors,
  baths,
  onChangeBaths,
  rooms,
  onChangeRooms,
}: PropertyStepperRowProps) {
  return (
    <View className="mb-4 w-full flex-row gap-3">
      {listingType !== 'sell' && (
        <StepperInput
          title="عدد الادوار"
          value={floors}
          onChange={onChangeFloors}
          min={0}
          max={20}
        />
      )}
      <StepperInput
        title="عدد الحمامات"
        value={baths}
        onChange={onChangeBaths}
        min={0}
        max={20}
      />
      <StepperInput
        title="عدد الغرف"
        value={rooms}
        onChange={onChangeRooms}
        min={0}
        max={20}
      />
    </View>
  );
}
