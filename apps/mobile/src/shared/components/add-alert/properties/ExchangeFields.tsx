import { View } from 'react-native';

import StepperInput from '@/shared/components/filters/StepperInput';

import type { AlertPropertiesState } from './constants';
import LabeledNumberInput from './LabeledNumberInput';
import type { AlertPropertiesChange } from './types';

export interface ExchangeFieldsProps {
  value: AlertPropertiesState;
  onChange: AlertPropertiesChange;
}

// Exchange: room/bath/floor steppers and the request / required years
export default function ExchangeFields({ value, onChange }: ExchangeFieldsProps) {
  return (
    <>
      <View className="mb-6 w-full flex-row gap-3">
        <StepperInput
          title="عدد الغرف"
          value={value.rooms}
          onChange={(val) => onChange('rooms', val)}
          min={0}
          max={20}
        />
        <StepperInput
          title="عدد الحمامات"
          value={value.baths}
          onChange={(val) => onChange('baths', val)}
          min={0}
          max={20}
        />
        <StepperInput
          title="عدد الادوار"
          value={value.floors}
          onChange={(val) => onChange('floors', val)}
          min={0}
          max={20}
        />
      </View>

      <View className="mb-6 mt-6 w-full flex-row gap-3">
        <LabeledNumberInput
          label="سنة الطلب"
          placeholder="2019"
          maxLength={4}
          value={value.requestYear}
          onChangeText={(text) => onChange('requestYear', text)}
        />
        <LabeledNumberInput
          label="السنة المطلوبة"
          placeholder="2025"
          maxLength={4}
          value={value.requiredYear}
          onChangeText={(text) => onChange('requiredYear', text)}
        />
      </View>
    </>
  );
}
