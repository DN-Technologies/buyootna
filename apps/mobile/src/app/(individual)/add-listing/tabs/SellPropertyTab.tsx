import { Text, TextInput, View } from 'react-native';

import AdLevelSelector from '@/shared/components/add-listing/AdLevelSelector';
import PhoneInputField from '@/shared/components/add-listing/PhoneInputField';
import PriceToggleField from '@/shared/components/add-listing/PriceToggleField';
import { useListingStore } from '@/shared/store/useListingStore';

export default function SellPropertyTab() {
  const {
    showPrice,
    price,
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

      {/* --- Price Toggle & Input --- */}
      <PriceToggleField
        label="السعر"
        showPrice={showPrice}
        onTogglePrice={(val) => updateField('showPrice', val)}
        price={price}
        onChangePrice={(text) => updateField('price', text)}
        required={true}
      />

      {/* --- Phone Number --- */}
      <PhoneInputField
        value={phoneNumber}
        onChangeText={(text) => updateField('phoneNumber', text)}
        required={true}
      />

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
