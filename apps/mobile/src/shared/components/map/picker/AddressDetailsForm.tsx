import { Text, TextInput, View } from 'react-native';

import type { AddressDetails } from './types';

interface AddressDetailsFormProps {
  addressLine: string;
  onChangeAddressLine: (text: string) => void;
  details: AddressDetails;
  onChangeField: (key: keyof AddressDetails, value: string) => void;
}

const inputClass =
  'h-10 rounded-xl border border-gray-200 bg-white px-3 font-cairo text-[13px] text-[#111111]';

function Field({
  label,
  value,
  onChange,
  placeholder,
  numeric = false,
  testID,
}: {
  label: string;
  value?: string;
  onChange: (text: string) => void;
  placeholder: string;
  numeric?: boolean;
  testID: string;
}) {
  return (
    <View className="flex-1 gap-1">
      <Text
        className="font-cairo-medium text-[11px] text-[#6B6A6A]"
        style={{ writingDirection: 'rtl' }}
      >
        {label}
      </Text>
      <TextInput
        testID={testID}
        value={value ?? ''}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#979797"
        keyboardType={numeric ? 'number-pad' : 'default'}
        className={inputClass}
        style={{ textAlign: 'right', writingDirection: 'rtl' }}
      />
    </View>
  );
}

// تفاصيل العنوان: an editable address line, then القطعة / الشارع /
// الجادة / المنزل and a landmark -- all optional
export function AddressDetailsForm({
  addressLine,
  onChangeAddressLine,
  details,
  onChangeField,
}: AddressDetailsFormProps) {
  return (
    <View className="mb-3 gap-2.5">
      <Field
        testID="address-line-input"
        label="العنوان"
        value={addressLine}
        onChange={onChangeAddressLine}
        placeholder="المنطقة، المدينة"
      />
      <View className="flex-row gap-2">
        <Field
          testID="address-block-input"
          label="القطعة"
          value={details.block}
          onChange={(v) => onChangeField('block', v)}
          placeholder="مثال: 6"
          numeric
        />
        <Field
          testID="address-street-input"
          label="الشارع"
          value={details.street}
          onChange={(v) => onChangeField('street', v)}
          placeholder="اسم أو رقم الشارع"
        />
      </View>
      <View className="flex-row gap-2">
        <Field
          testID="address-avenue-input"
          label="الجادة (اختياري)"
          value={details.avenue}
          onChange={(v) => onChangeField('avenue', v)}
          placeholder="رقم الجادة"
          numeric
        />
        <Field
          testID="address-building-input"
          label="المنزل / المبنى"
          value={details.building}
          onChange={(v) => onChangeField('building', v)}
          placeholder="رقم المنزل"
        />
      </View>
      <Field
        testID="address-landmark-input"
        label="علامة مميزة (اختياري)"
        value={details.landmark}
        onChange={(v) => onChangeField('landmark', v)}
        placeholder="مثال: بجانب الجمعية"
      />
    </View>
  );
}
