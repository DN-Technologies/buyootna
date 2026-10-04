import { Feather, Ionicons } from '@expo/vector-icons';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ImageDropzone,
  ListingTypeSelector,
  NumberStepper,
  OfficePickerModal,
  OfficePlanQuotaSelector,
  OrientationDropdown,
} from '@/features/office/components/add';

import { useOfficeAddListing } from './useOfficeAddListing';

export default function OfficeAddListingScreen() {
  const office = useOfficeAddListing();

  return (
    <SafeAreaView className="flex-1 bg-white" testID="office-add-screen">
      {/* --- Top Bar --- */}
      <View className="h-[52px] w-full flex-row items-center justify-between border-b border-[#ECECEC] px-4 py-1.5">
        {/* Left: Map / Saved icon */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={office.showMapInfoAlert}
          className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]"
          testID="top-map-button"
          accessibilityLabel="الخريطة"
        >
          <Ionicons name="map-outline" size={18} color="#15304D" />
        </TouchableOpacity>

        {/* Center: Title */}
        <Text className="font-cairo-semibold text-lg text-[#111111]">
          إضافة إعلان
        </Text>

        {/* Right: Back Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={office.goBack}
          className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]"
          testID="top-back-button"
          accessibilityLabel="رجوع"
        >
          <Feather name="arrow-right" size={20} color="#111111" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 130 }}
          className="flex-1 pt-4"
        >
          {/* --- Section 1: نوع الإعلان --- */}
          <View className="mb-6">
            <ListingTypeSelector
              value={office.listingType}
              onChange={office.setListingType}
            />
          </View>

          {/* --- Section 2: معلومات العقار --- */}
          <View className="mb-6 flex-col gap-4" testID="property-info-section">
            <Text className="text-right font-cairo-semibold text-lg text-black">
              معلومات العقار
            </Text>

            {/* Row 1: المحافظة & المنطقة */}
            <View className="w-full flex-row gap-2">
              {/* المنطقة */}
              <View className="flex-1 flex-col gap-1.5">
                <View className="flex-row items-center justify-end">
                  <Text className="text-sm font-cairo-medium text-[#111111]">
                    المنطقة
                  </Text>
                  <Text className="mr-0.5 text-sm font-cairo-medium text-[#D12121]">
                    *
                  </Text>
                </View>
                <TextInput
                  value={office.area}
                  onChangeText={office.setArea}
                  placeholder="اختر المنطقة"
                  placeholderTextColor="#979797"
                  className="h-[46px] rounded-md border border-[#ECECEC] bg-white px-3 text-right font-cairo-regular text-sm text-[#111111]"
                  testID="input-area"
                />
              </View>

              {/* المحافظة */}
              <View className="flex-1 flex-col gap-1.5">
                <View className="flex-row items-center justify-end">
                  <Text className="text-sm font-cairo-medium text-[#111111]">
                    المحافظة
                  </Text>
                  <Text className="mr-0.5 text-sm font-cairo-medium text-[#D12121]">
                    *
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => office.setActivePicker('governorate')}
                  className="h-[46px] justify-center rounded-md border border-[#ECECEC] bg-white px-3"
                  testID="picker-governorate"
                >
                  <Text
                    className={`text-right font-cairo-regular text-sm ${
                      office.governorate ? 'text-[#111111]' : 'text-[#979797]'
                    }`}
                  >
                    {office.governorate || 'اختر المحافظة'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Row 2: الموقع على الخريطة */}
            <View className="w-full flex-col gap-1.5">
              <View className="flex-row items-center justify-end">
                <Text className="text-sm font-cairo-medium text-[#111111]">
                  الموقع على الخريطة
                </Text>
                <Text className="mr-0.5 text-sm font-cairo-medium text-[#D12121]">
                  *
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={office.showMapLocationAlert}
                className="h-[46px] w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-3"
                testID="button-map-location"
              >
                <Ionicons name="location-outline" size={18} color="#15304D" />
                <Text className="font-cairo-regular text-sm text-[#979797]">
                  {office.mapLocation || 'حدد الموقع على الخريطة'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Row 3: فئة العقار & المساحة */}
            <View className="w-full flex-row gap-2">
              {/* المساحة */}
              <View className="flex-1 flex-col gap-1.5">
                <View className="flex-row items-center justify-end">
                  <Text className="text-sm font-cairo-medium text-[#111111]">
                    المساحة
                  </Text>
                  <Text className="mr-0.5 text-sm font-cairo-medium text-[#D12121]">
                    *
                  </Text>
                </View>
                <TextInput
                  value={office.space}
                  onChangeText={office.setSpace}
                  placeholder="300 م2"
                  placeholderTextColor="#979797"
                  className="h-[46px] rounded-md border border-[#ECECEC] bg-white px-3 text-right font-cairo-regular text-sm text-[#111111]"
                  testID="input-space"
                />
              </View>

              {/* فئة العقار */}
              <View className="flex-1 flex-col gap-1.5">
                <View className="flex-row items-center justify-end">
                  <Text className="text-sm font-cairo-medium text-[#111111]">
                    فئة العقار
                  </Text>
                  <Text className="mr-0.5 text-sm font-cairo-medium text-[#D12121]">
                    *
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => office.setActivePicker('category')}
                  className="h-[46px] justify-center rounded-md border border-[#ECECEC] bg-white px-3"
                  testID="picker-category"
                >
                  <Text
                    className={`text-right font-cairo-regular text-sm ${
                      office.category ? 'text-[#111111]' : 'text-[#979797]'
                    }`}
                  >
                    {office.category || 'اختر نوع عقارك'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Row 4: Exchange years OR Age/PACI */}
            {office.listingType === 'exchange' ? (
              <View className="w-full flex-row gap-2">
                {/* سنة الطلب */}
                <View className="flex-1 flex-col gap-1.5">
                  <Text className="text-right font-cairo-medium text-sm text-[#111111]">
                    سنة الطلب *
                  </Text>
                  <TextInput
                    value={office.requestYear}
                    onChangeText={office.setRequestYear}
                    placeholder="2019"
                    placeholderTextColor="#979797"
                    keyboardType="numeric"
                    className="h-[46px] rounded-md border border-[#ECECEC] bg-white px-3 text-right font-cairo-regular text-sm text-[#111111]"
                    testID="input-request-year"
                  />
                </View>

                {/* السنة المطلوبة */}
                <View className="flex-1 flex-col gap-1.5">
                  <Text className="text-right font-cairo-medium text-sm text-[#111111]">
                    السنة المطلوبة *
                  </Text>
                  <TextInput
                    value={office.requiredYear}
                    onChangeText={office.setRequiredYear}
                    placeholder="2025"
                    placeholderTextColor="#979797"
                    keyboardType="numeric"
                    className="h-[46px] rounded-md border border-[#ECECEC] bg-white px-3 text-right font-cairo-regular text-sm text-[#111111]"
                    testID="input-required-year"
                  />
                </View>
              </View>
            ) : (
              <View className="w-full flex-row gap-2">
                {/* الرقم الالي للعقار */}
                <View className="flex-1 flex-col gap-1.5">
                  <View className="flex-row items-center justify-end">
                    <Text className="text-sm font-cairo-medium text-[#111111]">
                      الرقم الالي للعقار
                    </Text>
                    <Text className="mr-0.5 text-sm font-cairo-medium text-[#D12121]">
                      *
                    </Text>
                  </View>
                  <TextInput
                    value={office.paciNumber}
                    onChangeText={office.setPaciNumber}
                    placeholder="768954093"
                    placeholderTextColor="#979797"
                    keyboardType="numeric"
                    className="h-[46px] rounded-md border border-[#ECECEC] bg-white px-3 text-right font-cairo-regular text-sm text-[#111111]"
                    testID="input-paci"
                  />
                </View>

                {/* عمر العقار */}
                <View className="flex-1 flex-col gap-1.5">
                  <View className="flex-row items-center justify-end">
                    <Text className="text-sm font-cairo-medium text-[#111111]">
                      عمر العقار
                    </Text>
                    <Text className="mr-0.5 text-sm font-cairo-medium text-[#D12121]">
                      *
                    </Text>
                  </View>
                  <TextInput
                    value={office.propertyAge}
                    onChangeText={office.setPropertyAge}
                    placeholder="السنين"
                    placeholderTextColor="#979797"
                    className="h-[46px] rounded-md border border-[#ECECEC] bg-white px-3 text-right font-cairo-regular text-sm text-[#111111]"
                    testID="input-age"
                  />
                </View>
              </View>
            )}

            {/* Steppers: conditional based on listingType and category */}
            {/* For Exchange Land: hide steppers (Figma 4494:142486) */}
            {/* For Rent: show Floors, Baths, Rooms (Figma 4494:142372) */}
            {/* For Exchange House: show Floors, Baths, Rooms (Figma 4494:142573) */}
            {/* For Sell: show Baths, Rooms (Figma 4494:141833) */}
            {!(
              office.listingType === 'exchange' &&
              office.isLandCategory
            ) && (
              <View className="w-full flex-col gap-3">
                {/* Floors Stepper (if Rent or Exchange House) */}
                {(office.listingType === 'rent' ||
                  (office.listingType === 'exchange' &&
                    !office.isLandCategory)) && (
                  <View className="w-full">
                    <NumberStepper
                      label="عدد الادوار"
                      value={office.floorsCount}
                      onChange={office.setFloorsCount}
                      testID="stepper-floors"
                    />
                  </View>
                )}

                {/* Bathrooms & Rooms Stepper */}
                <View className="w-full flex-row gap-2">
                  <NumberStepper
                    label="عدد الحمامات"
                    value={office.bathroomsCount}
                    onChange={office.setBathroomsCount}
                    testID="stepper-bathrooms"
                  />
                  <NumberStepper
                    label="عدد الغرف"
                    value={office.roomsCount}
                    onChange={office.setRoomsCount}
                    testID="stepper-rooms"
                  />
                </View>
              </View>
            )}

            {/* Frontage / Orientation Dropdown (Figma 4494:141814 & 4494:142357) */}
            <View className="w-full">
              <OrientationDropdown
                value={office.features}
                onSelect={office.setFeatures}
                testID="orientation-dropdown"
              />
              {/* Hidden/accessible input-features for full backward compatibility */}
              <TextInput
                value={office.features}
                onChangeText={office.setFeatures}
                className="hidden h-0 w-0 opacity-0"
                testID="input-features"
              />
            </View>
          </View>

          {/* --- Section 3: السعر والتفاصيل --- */}
          <View className="mb-6 flex-col gap-4" testID="price-details-section">
            <Text className="text-right font-cairo-semibold text-lg text-black">
              السعر والتفاصيل
            </Text>

            {/* Price Switch Row */}
            <View className="w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-3 py-2">
              <Switch
                value={office.isPriceActive}
                onValueChange={office.setIsPriceActive}
                trackColor={{ false: '#ECECEC', true: '#15304D' }}
                thumbColor="#FFFFFF"
                testID="toggle-price-active"
              />
              <Text className="font-cairo-medium text-sm text-[#111111]">
                {office.listingType === 'rent'
                  ? 'الايجار الشهري'
                  : 'تحديد السعر'}
              </Text>
            </View>

            {/* Price Input if enabled */}
            {office.isPriceActive && (
              <View className="w-full flex-col gap-1.5">
                <Text className="text-right font-cairo-medium text-sm text-[#111111]">
                  {office.listingType === 'rent'
                    ? 'الايجار الشهري (بالدينار الكويتي) *'
                    : 'السعر (د.ك) *'}
                </Text>
                <TextInput
                  value={office.price}
                  onChangeText={office.setPrice}
                  placeholder="بالدينار الكويتي"
                  placeholderTextColor="#979797"
                  keyboardType="numeric"
                  className="h-[46px] rounded-md border border-[#ECECEC] bg-white px-3 text-right font-cairo-regular text-sm text-[#111111]"
                  testID="input-price"
                />
              </View>
            )}

            {/* Property Income Toggle for Sell (Figma 4494:141833, 4494:142107) */}
            {office.listingType === 'sell' && (
              <View className="w-full flex-col gap-2">
                <View className="w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-3 py-2">
                  <Switch
                    value={office.isIncomeActive}
                    onValueChange={office.setIsIncomeActive}
                    trackColor={{ false: '#ECECEC', true: '#15304D' }}
                    thumbColor="#FFFFFF"
                    testID="toggle-income-active"
                  />
                  <Text className="font-cairo-medium text-sm text-[#111111]">
                    مدخول العقار
                  </Text>
                </View>
                {office.isIncomeActive && (
                  <View className="w-full flex-col gap-1.5">
                    <Text className="text-right font-cairo-medium text-sm text-[#111111]">
                      مدخول العقار (د.ك)
                    </Text>
                    <TextInput
                      value={office.income}
                      onChangeText={office.setIncome}
                      placeholder="بالدينار الكويتي"
                      placeholderTextColor="#979797"
                      keyboardType="numeric"
                      className="h-[46px] rounded-md border border-[#ECECEC] bg-white px-3 text-right font-cairo-regular text-sm text-[#111111]"
                      testID="input-income"
                    />
                  </View>
                )}
              </View>
            )}

            {/* Phone Number */}
            <View className="w-full flex-col gap-1.5">
              <View className="flex-row items-center justify-end">
                <Text className="text-sm font-cairo-medium text-[#111111]">
                  رقم الهاتف
                </Text>
                <Text className="mr-0.5 text-sm font-cairo-medium text-[#D12121]">
                  *
                </Text>
              </View>
              <View className="w-full flex-row gap-2">
                {/* Kuwait Code Box */}
                <View className="h-[46px] flex-row items-center gap-1 rounded-lg border border-[#ECECEC] bg-white px-3">
                  <Feather name="chevron-down" size={14} color="#979797" />
                  <Text className="font-cairo-regular text-sm text-[#979797]">
                    +965
                  </Text>
                </View>

                {/* Phone Input */}
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
            </View>

            {/* Rent Specific Fields (Figma 4494:142372) */}
            {office.listingType === 'rent' && (
              <>
                {/* Additional expenses */}
                <View className="w-full flex-col gap-1.5">
                  <Text className="text-right font-cairo-medium text-sm text-[#111111]">
                    المصاريف الاضافية
                  </Text>
                  <TextInput
                    value={office.additionalExpenses}
                    onChangeText={office.setAdditionalExpenses}
                    placeholder="اكتب المصاريف الاضافية ان وجدت..."
                    placeholderTextColor="#979797"
                    multiline
                    numberOfLines={2}
                    className="min-h-[80px] rounded-lg border border-[#ECECEC] bg-white p-3 text-right font-cairo-regular text-sm text-[#111111]"
                    testID="input-additional-expenses"
                  />
                </View>

                {/* Rental terms */}
                <View className="w-full flex-col gap-1.5">
                  <Text className="text-right font-cairo-medium text-sm text-[#111111]">
                    شروط الايجار
                  </Text>
                  <TextInput
                    value={office.rentConditions}
                    onChangeText={office.setRentConditions}
                    placeholder="اكتب متطلبات وشروط الايجار ان وجد..."
                    placeholderTextColor="#979797"
                    multiline
                    numberOfLines={2}
                    className="min-h-[80px] rounded-lg border border-[#ECECEC] bg-white p-3 text-right font-cairo-regular text-sm text-[#111111]"
                    testID="input-rent-conditions"
                  />
                </View>
              </>
            )}

            {/* Exchange Specific: Allocation status (Figma 4494:142486, 4494:142573) */}
            {office.listingType === 'exchange' && (
              <View className="w-full flex-col gap-1.5">
                <Text className="text-right font-cairo-medium text-sm text-[#111111]">
                  حالة التخصيص
                </Text>
                <TextInput
                  value={office.allocationState}
                  onChangeText={office.setAllocationState}
                  placeholder="اكتب نبذة عن الاعلان لاقناع العملاء..."
                  placeholderTextColor="#979797"
                  multiline
                  numberOfLines={2}
                  className="min-h-[80px] rounded-lg border border-[#ECECEC] bg-white p-3 text-right font-cairo-regular text-sm text-[#111111]"
                  testID="input-allocation-state"
                />
              </View>
            )}

            {/* Ad Description */}
            <View className="w-full flex-col gap-1.5">
              <View className="flex-row items-center justify-end">
                <Text className="text-sm font-cairo-medium text-[#111111]">
                  تفاصيل الاعلان
                </Text>
                <Text className="mr-0.5 text-sm font-cairo-medium text-[#D12121]">
                  *
                </Text>
              </View>
              <TextInput
                value={office.description}
                onChangeText={office.setDescription}
                placeholder="اكتب نبذة عن الاعلان لاقناع العملاء..."
                placeholderTextColor="#979797"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="min-h-[100px] rounded-lg border border-[#ECECEC] bg-white p-3 text-right font-cairo-regular text-sm text-[#111111]"
                testID="input-description"
              />
            </View>

            {/* Office Plan Quota Selector matching Figma 4494:141833 & 4494:142107 -- driven
                by the office persona's real wallet balance (QA: no hardcoded quotas) */}
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

          {/* --- Section 4: الصور --- */}
          <View className="mb-6">
            <ImageDropzone images={office.images} onChange={office.setImages} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- Sticky Bottom CTA Bar --- */}
      <View className="w-full border-t border-[#ECECEC] bg-white px-4 py-3 pb-8">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={office.handlePreviewAd}
          disabled={!office.isFormValid}
          className={`h-12 w-full items-center justify-center rounded-full ${
            office.isFormValid ? 'bg-[#15304D]' : 'bg-[#A6A6A6]'
          }`}
          testID="button-preview-ad"
        >
          <Text className="font-cairo-semibold text-sm text-white">
            معاينة الاعلان
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- Selection Modals --- */}
      <OfficePickerModal
        visible={office.activePicker !== null}
        title={office.pickerTitle}
        options={office.pickerOptions}
        onSelect={office.selectPickerItem}
        onClose={() => office.setActivePicker(null)}
      />
    </SafeAreaView>
  );
}
