import { View } from 'react-native';

import AdLevelSection from '@/shared/components/add-listing/AdLevelSection';
import ContactToggles from '@/shared/components/add-listing/ContactToggles';
import { TextAreaField } from '@/shared/components/add-listing/FormField';
import PriceToggleField from '@/shared/components/add-listing/PriceToggleField';
import SectionTitle from '@/shared/components/add-listing/SectionTitle';
import { useListingStore } from '@/shared/store/useListingStore';

export default function ExchangePropertyTab() {
  const { showPrice, price, allocationState, adDetails, updateField } =
    useListingStore();

  return (
    <View className="w-full" style={{ gap: 16 }}>
      <SectionTitle>السعر والتفاصيل</SectionTitle>

      <PriceToggleField
        label="السعر"
        testID="toggle-price"
        showPrice={showPrice}
        onTogglePrice={(val) => updateField('showPrice', val)}
        price={price}
        onChangePrice={(text) => updateField('price', text)}
        required
      />

      <ContactToggles />

      <TextAreaField
        label="حالة التخصيص"
        testID="input-allocation"
        placeholder="اكتب حالة التخصيص ان وجدت.."
        value={allocationState}
        onChangeText={(text) => updateField('allocationState', text)}
      />

      <TextAreaField
        label="تفاصيل الاعلان"
        required
        testID="input-details"
        placeholder="اكتب نبذة عن الاعلان لاقناع العملاء..."
        value={adDetails}
        onChangeText={(text) => updateField('adDetails', text)}
      />

      <AdLevelSection />
    </View>
  );
}
