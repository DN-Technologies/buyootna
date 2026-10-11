import { View } from 'react-native';

import type { AlertPropertiesState } from './constants';
import LabeledNumberInput from './LabeledNumberInput';
import type { AlertPropertiesChange } from './types';

export interface PriceAreaFieldsProps {
  value: AlertPropertiesState;
  onChange: AlertPropertiesChange;
}

// Sale: السعر + المساحة. Rent: قيمة الايجار + المساحة.
export default function PriceAreaFields({ value, onChange }: PriceAreaFieldsProps) {
  const isRent = value.operationType === 'rent';

  return (
    <View className="mb-6 w-full flex-row gap-3">
      <LabeledNumberInput
        label={isRent ? 'قيمة الايجار' : 'السعر'}
        optional
        placeholder="200,000 د.ك"
        value={isRent ? value.rentValue : value.price}
        onChangeText={(text) => onChange(isRent ? 'rentValue' : 'price', text)}
      />
      <LabeledNumberInput
        label="المساحة"
        optional
        placeholder="300 م2"
        value={value.areaSize}
        onChangeText={(text) => onChange('areaSize', text)}
      />
    </View>
  );
}
