import { Text, TextInput, View } from 'react-native';

import AdLevelSelector from '@/shared/components/add-listing/AdLevelSelector';
import PhoneInputField from '@/shared/components/add-listing/PhoneInputField';
import PriceToggleField from '@/shared/components/add-listing/PriceToggleField';
import { useListingStore } from '@/shared/store/useListingStore';

export default function RentPropertyTab() {
  const {
    showPrice,
    monthlyRent,
    additionalExpenses,
    rentConditions,
    phoneNumber,
    adDetails,
    adLevel,
    updateField,
  } = useListingStore();

  return (
    <View className="pb-4">
      {/* --- Section Title --- */}
      <Text
        className="mb-4 font-cairo-semibold text-lg text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        السعر والتفاصيل
      </Text>

      {/* --- Monthly Rent Toggle & Input --- */}
      <PriceToggleField
        label="الايجار الشهري"
        showPrice={showPrice}
        onTogglePrice={(val) => updateField('showPrice', val)}
        price={monthlyRent}
        onChangePrice={(text) => updateField('monthlyRent', text)}
        required={true}
      />

      {/* --- Phone Number --- */}
      <PhoneInputField
        value={phoneNumber}
        onChangeText={(text) => updateField('phoneNumber', text)}
        required={true}
      />

      {/* --- Additional Expenses --- */}
      <View className="mb-6 w-full">
        <Text
          className="mb-1 font-cairo-medium text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          المصاريف الاضافية
        </Text>
        <View
          className="h-24 w-full rounded-md border border-[#ECECEC] bg-white px-4 py-3"
          style={{ width: '100%' }}
        >
          <TextInput
            className="flex-1 text-right font-cairo-medium leading-6 text-[#111111]"
            style={{ flex: 1, textAlign: 'right' }}
            placeholder="اكتب المصاريف الاضافية ان وجدت.."
            placeholderTextColor="#979797"
            multiline
            textAlignVertical="top"
            value={additionalExpenses}
            onChangeText={(text) => updateField('additionalExpenses', text)}
          />
        </View>
      </View>

      {/* --- Rental Conditions --- */}
      <View className="mb-6 w-full">
        <Text
          className="mb-1 font-cairo-medium text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          شروط الايجار
        </Text>
        <View
          className="h-24 w-full rounded-md border border-[#ECECEC] bg-white px-4 py-3"
          style={{ width: '100%' }}
        >
          <TextInput
            className="flex-1 text-right font-cairo-medium leading-6 text-[#111111]"
            style={{ flex: 1, textAlign: 'right' }}
            placeholder="اكتب متطلبات وشروط الايجار ان وجد.."
            placeholderTextColor="#979797"
            multiline
            textAlignVertical="top"
            value={rentConditions}
            onChangeText={(text) => updateField('rentConditions', text)}
          />
        </View>
      </View>

      {/* --- Ad Details --- */}
      <View className="mb-6 w-full">
        <Text
          className="mb-1 font-cairo-medium text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          تفاصيل الاعلان <Text className="text-red-500">*</Text>
        </Text>
        <View
          className="h-32 w-full rounded-md border border-[#ECECEC] bg-white px-4 py-3"
          style={{ width: '100%' }}
        >
          <TextInput
            className="flex-1 text-right font-cairo-medium leading-6 text-[#111111]"
            style={{ flex: 1, textAlign: 'right' }}
            placeholder="اكتب نبذة عن الاعلان لاقناع العملاء..."
            placeholderTextColor="#979797"
            multiline
            textAlignVertical="top"
            value={adDetails}
            onChangeText={(text) => updateField('adDetails', text)}
          />
        </View>
      </View>

      {/* --- Ad Level Selection --- */}
      <AdLevelSelector
        value={adLevel}
        onChange={(level) => updateField('adLevel', level)}
      />
    </View>
  );
}
