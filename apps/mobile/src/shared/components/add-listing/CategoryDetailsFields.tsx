import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import FormField, {
  INPUT_BOX_CLASS,
  INPUT_TEXT_CLASS,
  PLACEHOLDER_COLOR,
} from '@/shared/components/add-listing/FormField';
import ToggleField from '@/shared/components/add-listing/ToggleField';
import StepperInput from '@/shared/components/filters/StepperInput';
import { useListingStore } from '@/shared/store/useListingStore';
import {
  getCategoryFields,
  LAND_USES,
  RENTAL_STATUSES,
} from '@/shared/utils/data/propertyCategories';

/** One choice among a few, as chips (نوع التخصيص, حالة التأجير). */
function ChoiceChips({
  options,
  value,
  onChange,
  testID,
}: {
  options: readonly { id: string; label: string }[];
  value: string | null;
  onChange: (id: string) => void;
  testID: string;
}) {
  return (
    <View className="w-full flex-row flex-wrap" style={{ gap: 8 }}>
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            testID={`${testID}-${option.id}`}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            activeOpacity={0.8}
            onPress={() => onChange(option.id)}
            className={`h-10 items-center justify-center rounded-full border px-4 ${
              selected
                ? 'border-[#15304D] bg-[#15304D]'
                : 'border-[#ECECEC] bg-white'
            }`}
          >
            <Text
              numberOfLines={1}
              textBreakStrategy="simple"
              className={`px-0.5 font-cairo-medium text-sm leading-[22px] ${
                selected ? 'text-white' : 'text-[#111111]'
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** A number box in KWD (الدخل الشهري, مدخول العقار). */
function AmountInput({
  value,
  onChangeText,
  testID,
}: {
  value: string;
  onChangeText: (text: string) => void;
  testID: string;
}) {
  return (
    <View className={INPUT_BOX_CLASS}>
      <TextInput
        testID={testID}
        className={INPUT_TEXT_CLASS}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor={PLACEHOLDER_COLOR}
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/[^\d.]/g, ''))}
      />
      <Text className="font-cairo text-sm text-[#6B6A6A]">د.ك</Text>
    </View>
  );
}

/**
 * The fields that depend on the property category, from the requirements
 * document (المتغير حسب الفئة): a flat's floor, a building's flats, rental
 * status and income, land's use and allocation, the units and monthly
 * income of commercial / investment property, and whether a farm is
 * cultivated or built. Rooms, baths, floors and age stay where they were.
 * Reads and writes the shared listing store, so the individual and the
 * office forms show the same fields.
 */
export default function CategoryDetailsFields() {
  const {
    listingType,
    propertyCategory,
    floorNumber,
    apartmentsCount,
    rentalStatus,
    propertyIncome,
    landUse,
    allocationState,
    unitsCount,
    monthlyIncome,
    isCultivated,
    isBuilt,
    updateField,
  } = useListingStore();
  const fields = getCategoryFields(propertyCategory?.id);

  if (
    !fields.floorNumber &&
    !fields.apartments &&
    !fields.landUse &&
    !fields.units &&
    !fields.farm
  ) {
    return null;
  }

  return (
    <View testID="category-details" className="w-full" style={{ gap: 20 }}>
      {fields.floorNumber && (
        <StepperInput
          title="رقم الدور"
          value={floorNumber}
          onChange={(value) => updateField('floorNumber', value)}
          min={0}
          max={60}
          size="lg"
        />
      )}

      {fields.apartments && (
        <>
          <StepperInput
            title="عدد الشقق"
            value={apartmentsCount}
            onChange={(value) => updateField('apartmentsCount', value)}
            min={0}
            max={200}
            size="lg"
          />
          <FormField label="حالة التأجير">
            <ChoiceChips
              testID="rental-status"
              options={RENTAL_STATUSES.map((label) => ({ id: label, label }))}
              value={rentalStatus || null}
              onChange={(value) => updateField('rentalStatus', value)}
            />
          </FormField>
          {/* A sale has its own مدخول العقار toggle in the price section */}
          {listingType !== 'sell' && (
            <FormField label="مدخول العقار">
              <AmountInput
                testID="input-building-income"
                value={propertyIncome}
                onChangeText={(value) => updateField('propertyIncome', value)}
              />
            </FormField>
          )}
        </>
      )}

      {fields.landUse && (
        <>
          <FormField label="نوع التخصيص">
            <ChoiceChips
              testID="land-use"
              options={LAND_USES}
              value={landUse}
              onChange={(value) => updateField('landUse', value)}
            />
          </FormField>
          {/* An exchange ad asks for حالة التخصيص in its own section */}
          {listingType !== 'exchange' && (
            <FormField label="حالة التخصيص">
              <View className={INPUT_BOX_CLASS}>
                <TextInput
                  testID="input-land-allocation"
                  className={INPUT_TEXT_CLASS}
                  placeholder="مثال: مخصصة، تحت التخصيص"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={allocationState}
                  onChangeText={(value) => updateField('allocationState', value)}
                />
              </View>
            </FormField>
          )}
        </>
      )}

      {fields.units && (
        <>
          <StepperInput
            title="عدد الوحدات أو المحلات"
            value={unitsCount}
            onChange={(value) => updateField('unitsCount', value)}
            min={0}
            max={500}
            size="lg"
          />
          <FormField label="الدخل الشهري">
            <AmountInput
              testID="input-monthly-income"
              value={monthlyIncome}
              onChangeText={(value) => updateField('monthlyIncome', value)}
            />
          </FormField>
        </>
      )}

      {fields.farm && (
        <View className="w-full" style={{ gap: 8 }}>
          <ToggleField
            label="مزروعة"
            value={isCultivated}
            onToggle={(value) => updateField('isCultivated', value)}
            testID="toggle-cultivated"
          />
          <ToggleField
            label="مبنية"
            value={isBuilt}
            onToggle={(value) => updateField('isBuilt', value)}
            testID="toggle-built"
          />
        </View>
      )}
    </View>
  );
}
