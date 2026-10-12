import { View } from 'react-native';

import AdLevelSection from '@/shared/components/add-listing/AdLevelSection';
import ContactToggles from '@/shared/components/add-listing/ContactToggles';
import { TextAreaField } from '@/shared/components/add-listing/FormField';
import PriceToggleField from '@/shared/components/add-listing/PriceToggleField';
import SectionTitle from '@/shared/components/add-listing/SectionTitle';
import { useListingStore } from '@/shared/store/useListingStore';

export default function RentPropertyTab() {
  const {
    showPrice,
    monthlyRent,
    additionalExpenses,
    rentConditions,
    adDetails,
    updateField,
  } = useListingStore();

  return (
    <View className="w-full" style={{ gap: 16 }}>
      <SectionTitle>السعر والتفاصيل</SectionTitle>

      <PriceToggleField
        label="الايجار الشهري"
        testID="toggle-price"
        showPrice={showPrice}
        onTogglePrice={(val) => updateField('showPrice', val)}
        price={monthlyRent}
        onChangePrice={(text) => updateField('monthlyRent', text)}
        required
      />

      <ContactToggles />

      <TextAreaField
        label="المصاريف الاضافية"
        placeholder="اكتب المصاريف الاضافية ان وجدت.."
        value={additionalExpenses}
        onChangeText={(text) => updateField('additionalExpenses', text)}
      />

      <TextAreaField
        label="شروط الايجار"
        placeholder="اكتب متطلبات وشروط الايجار ان وجد.."
        value={rentConditions}
        onChangeText={(text) => updateField('rentConditions', text)}
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
