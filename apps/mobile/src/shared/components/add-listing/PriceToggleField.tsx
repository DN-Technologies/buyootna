import { View } from 'react-native';

import {
  BoxTextInput,
  INPUT_BOX_CLASS,
} from '@/shared/components/add-listing/FormField';
import ToggleField from '@/shared/components/add-listing/ToggleField';
import { toWesternDigits } from '@/shared/utils/arabicNumerals';

interface PriceToggleFieldProps {
  label?: string;
  showPrice: boolean;
  onTogglePrice: (val: boolean) => void;
  price: string;
  onChangePrice: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  testID?: string;
}

export default function PriceToggleField({
  label = 'السعر',
  showPrice,
  onTogglePrice,
  price,
  onChangePrice,
  placeholder = 'بالدينار الكويتي',
  required = false,
  testID,
}: PriceToggleFieldProps) {
  return (
    <ToggleField
      label={label}
      value={showPrice}
      onToggle={onTogglePrice}
      required={required}
      testID={testID}
    >
      <View className={INPUT_BOX_CLASS}>
        <BoxTextInput
          placeholder={placeholder}
          keyboardType="numeric"
          value={price}
          onChangeText={(text) => onChangePrice(toWesternDigits(text))}
        />
      </View>
    </ToggleField>
  );
}
