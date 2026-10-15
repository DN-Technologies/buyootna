import { Feather } from '@expo/vector-icons';
import { Text, TextInput, View } from 'react-native';

import {
  OfficeField,
  OfficeSectionTitle,
  OfficeTextArea,
  OfficeTextField,
  OfficeToggleRow,
} from './OfficeFormFields';
import { OfficePlanQuotaSelector } from './OfficePlanQuotaSelector';
import type { OfficeAddListing } from './useOfficeAddListing';

interface SectionProps {
  office: OfficeAddListing;
}

/** The price (or monthly rent) switch and its input. */
function PriceFields({ office }: SectionProps) {
  const isRent = office.listingType === 'rent';
  return (
    <>
      {/* Sale and rent ads always state a price (Ministry of Commerce,
          December 2024): no switch to hide it there */}
      {!office.priceRequired && (
        <OfficeToggleRow
          label={isRent ? 'الايجار الشهري' : 'تحديد السعر'}
          value={office.isPriceActive}
          onValueChange={office.setIsPriceActive}
          testID="toggle-price-active"
        />
      )}
      {(office.isPriceActive || office.priceRequired) && (
        <OfficeTextField
          label={isRent ? 'الايجار الشهري (بالدينار الكويتي) *' : 'السعر (د.ك) *'}
          value={office.price}
          onChangeText={office.setPrice}
          placeholder="بالدينار الكويتي"
          keyboardType="numeric"
          testID="input-price"
        />
      )}
    </>
  );
}

/** مدخول العقار, on sale ads only (Figma 4494:141833, 4494:142107). */
function IncomeFields({ office }: SectionProps) {
  if (office.listingType !== 'sell') return null;
  return (
    <View className="w-full flex-col gap-2">
      <OfficeToggleRow
        label="مدخول العقار"
        value={office.isIncomeActive}
        onValueChange={office.setIsIncomeActive}
        testID="toggle-income-active"
      />
      {office.isIncomeActive && (
        <OfficeTextField
          label="مدخول العقار (د.ك)"
          value={office.income}
          onChangeText={office.setIncome}
          placeholder="بالدينار الكويتي"
          keyboardType="numeric"
          testID="input-income"
        />
      )}
    </View>
  );
}

function PhoneField({ office }: SectionProps) {
  return (
    <OfficeField label="رقم الهاتف" required>
      <View className="w-full flex-row gap-2">
        <View className="h-[46px] flex-row items-center gap-1 rounded-lg border border-[#ECECEC] bg-white px-3">
          <Feather name="chevron-down" size={14} color="#979797" />
          <Text className="font-cairo-regular text-sm text-[#979797]">+965</Text>
        </View>
        <TextInput
          value={office.phone}
          onChangeText={office.setPhone}
          placeholder="58094586"
          placeholderTextColor="#979797"
          keyboardType="phone-pad"
          className="h-[46px] flex-1 rounded-md border border-[#ECECEC] bg-white px-3 text-right font-cairo-regular text-sm text-[#111111]"
          testID="input-phone"
        />
      </View>
    </OfficeField>
  );
}

/** The text boxes only one listing type has. */
function ListingTypeNotes({ office }: SectionProps) {
  if (office.listingType === 'rent') {
    // Figma 4494:142372
    return (
      <>
        <OfficeTextArea
          label="المصاريف الاضافية"
          value={office.additionalExpenses}
          onChangeText={office.setAdditionalExpenses}
          placeholder="اكتب المصاريف الاضافية ان وجدت..."
          testID="input-additional-expenses"
        />
        <OfficeTextArea
          label="شروط الايجار"
          value={office.rentConditions}
          onChangeText={office.setRentConditions}
          placeholder="اكتب متطلبات وشروط الايجار ان وجد..."
          testID="input-rent-conditions"
        />
      </>
    );
  }
  if (office.listingType === 'exchange') {
    // Figma 4494:142486, 4494:142573
    return (
      <OfficeTextArea
        label="حالة التخصيص"
        value={office.allocationState}
        onChangeText={office.setAllocationState}
        placeholder="اكتب نبذة عن الاعلان لاقناع العملاء..."
        testID="input-allocation-state"
      />
    );
  }
  return null;
}

/** السعر والتفاصيل: price, income, phone, notes, description, plan quota. */
export default function OfficePriceDetailsSection({ office }: SectionProps) {
  return (
    <View className="mb-6 flex-col gap-4" testID="price-details-section">
      <OfficeSectionTitle>السعر والتفاصيل</OfficeSectionTitle>

      <PriceFields office={office} />
      <IncomeFields office={office} />
      <PhoneField office={office} />
      <ListingTypeNotes office={office} />

      <OfficeTextArea
        tall
        required
        label="تفاصيل الاعلان"
        value={office.description}
        onChangeText={office.setDescription}
        placeholder="اكتب نبذة عن الاعلان لاقناع العملاء..."
        testID="input-description"
      />

      {/* Driven by the office persona's real wallet balance (QA: no
          hardcoded quotas); Figma 4494:141833 & 4494:142107 */}
      <OfficePlanQuotaSelector
        selectedPlan={office.selectedPlan}
        onSelectPlan={office.setSelectedPlan}
        silverQuota={office.silverQuota}
        normalQuota={office.normalQuota}
        testID="office-plan-quota-selector"
      />
      {!office.isWalletLoading && office.totalQuota === 0 && (
        <Text
          className="mt-2 text-right font-cairo-medium text-xs text-[#D12121]"
          style={{ writingDirection: 'rtl' }}
        >
          لا توجد إعلانات متبقية في باقتك، يرجى شراء باقة إعلانية لنشر عقار جديد.
        </Text>
      )}
    </View>
  );
}
