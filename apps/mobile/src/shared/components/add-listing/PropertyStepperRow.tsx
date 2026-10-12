import { View } from 'react-native';

import StepperInput from '@/shared/components/filters/StepperInput';
import type { CategoryFields } from '@/shared/utils/data/propertyCategories';

interface PropertyStepperRowProps {
  // Which counts the picked category has (getCategoryFields)
  fields: CategoryFields;
  floors: number;
  onChangeFloors: (value: number) => void;
  baths: number;
  onChangeBaths: (value: number) => void;
  rooms: number;
  onChangeRooms: (value: number) => void;
}

/** عدد الغرف / الحمامات / الادوار, each only if the category has it. */
export default function PropertyStepperRow({
  fields,
  floors,
  onChangeFloors,
  baths,
  onChangeBaths,
  rooms,
  onChangeRooms,
}: PropertyStepperRowProps) {
  // Land and farms: no row at all
  if (!fields.rooms && !fields.baths && !fields.floors) return null;

  return (
    <View testID="stepper-row" className="w-full flex-row" style={{ gap: 8 }}>
      {fields.rooms && (
        <StepperInput
          title="عدد الغرف"
          value={rooms}
          onChange={onChangeRooms}
          min={0}
          max={20}
          size="lg"
        />
      )}
      {fields.baths && (
        <StepperInput
          title="عدد الحمامات"
          value={baths}
          onChange={onChangeBaths}
          min={0}
          max={20}
          size="lg"
        />
      )}
      {fields.floors && (
        <StepperInput
          title="عدد الادوار"
          value={floors}
          onChange={onChangeFloors}
          min={0}
          max={20}
          size="lg"
        />
      )}
    </View>
  );
}
