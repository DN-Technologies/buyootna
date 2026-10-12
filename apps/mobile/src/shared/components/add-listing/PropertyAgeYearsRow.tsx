import { Image } from 'expo-image';
import { View } from 'react-native';

import FormField, {
  BoxTextInput,
  INPUT_BOX_CLASS,
} from '@/shared/components/add-listing/FormField';
import type { ListingType } from '@/shared/store/useListingStore';
import { toWesternDigits } from '@/shared/utils/arabicNumerals';

interface PropertyAgeYearsRowProps {
  listingType: ListingType;
  // Land and farms have no age
  showPropertyAge: boolean;
  // Ads published before these became required can be edited without them
  required: boolean;
  requestYear: string;
  onChangeRequestYear: (value: string) => void;
  requiredYear: string;
  onChangeRequiredYear: (value: string) => void;
  propertyAge: string;
  onChangePropertyAge: (value: string) => void;
  automatedNumber: string;
  onChangeAutomatedNumber: (value: string) => void;
}

interface NumberFieldProps {
  label: string;
  required: boolean;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  testID: string;
  trailing?: React.ReactNode;
}

function NumberField({
  label,
  required,
  placeholder,
  value,
  onChange,
  testID,
  trailing,
}: NumberFieldProps) {
  return (
    <FormField label={label} required={required} flex>
      <View className={INPUT_BOX_CLASS} style={{ gap: 8 }}>
        <BoxTextInput
          testID={testID}
          placeholder={placeholder}
          keyboardType="numeric"
          value={value}
          onChangeText={(text) => onChange(toWesternDigits(text))}
        />
        {trailing}
      </View>
    </FormField>
  );
}

export default function PropertyAgeYearsRow({
  listingType,
  showPropertyAge,
  required,
  requestYear,
  onChangeRequestYear,
  requiredYear,
  onChangeRequiredYear,
  propertyAge,
  onChangePropertyAge,
  automatedNumber,
  onChangeAutomatedNumber,
}: PropertyAgeYearsRowProps) {
  if (listingType === 'exchange') {
    return (
      <View className="w-full flex-row" style={{ gap: 8 }}>
        <NumberField
          label="سنة الطلب"
          required
          placeholder="2019"
          value={requestYear}
          onChange={onChangeRequestYear}
          testID="input-request-year"
        />
        <NumberField
          label="السنة المطلوبة"
          required
          placeholder="2025"
          value={requiredYear}
          onChange={onChangeRequiredYear}
          testID="input-required-year"
        />
      </View>
    );
  }

  return (
    <View className="w-full flex-row" style={{ gap: 8 }}>
      {showPropertyAge && (
        <NumberField
          label="عمر العقار"
          required={required}
          placeholder="السنين"
          value={propertyAge}
          onChange={onChangePropertyAge}
          testID="input-property-age"
        />
      )}
      <NumberField
        label="الرقم الالي للعقار"
        required={required}
        placeholder="768954093"
        value={automatedNumber}
        onChange={onChangeAutomatedNumber}
        testID="input-automated-number"
        trailing={
          <Image
            source={require('@/assets/icons/add-listing/automated-number.png')}
            style={{ width: 17, height: 16 }}
            contentFit="contain"
          />
        }
      />
    </View>
  );
}
