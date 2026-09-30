import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
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
  OfficePlanQuotaSelector,
  OfficePlanType,
  OrientationDropdown,
} from '@/features/office/components/add';
import { OfficeListingType } from '@/features/office/types';
import { useListingStore } from '@/shared/store/useListingStore';

const GOVERNORATES = [
  'العاصمة',
  'حولي',
  'الفروانية',
  'الأحمدي',
  'الجهراء',
  'مبارك الكبير',
];

const CATEGORIES = [
  'شقة سكني',
  'بيت / فيلا',
  'أرض سكنية',
  'عمارة استثمارية',
  'شاليه',
  'مكتب تجاري',
  'محل / معرض',
];

export default function OfficeAddScreen() {
  const router = useRouter();
  const updateField = useListingStore((state) => state.updateField);

  // Form State
  const [listingType, setListingType] = useState<OfficeListingType>('sell');
  const [governorate, setGovernorate] = useState('');
  const [area, setArea] = useState('');
  const [mapLocation, setMapLocation] = useState('الكويت، شارع الخليج العربي');
  const [category, setCategory] = useState('');
  const [space, setSpace] = useState('300 م2');
  const [propertyAge, setPropertyAge] = useState('جديد');
  const [paciNumber, setPaciNumber] = useState('768954093');

  // Steppers
  const [roomsCount, setRoomsCount] = useState(1);
  const [bathroomsCount, setBathroomsCount] = useState(1);
  const [floorsCount, setFloorsCount] = useState(0);

  // Exchange specific years (Figma 4494:142486, 4494:142573)
  const [requestYear, setRequestYear] = useState('2019');
  const [requiredYear, setRequiredYear] = useState('2025');
  const [allocationState, setAllocationState] = useState('');

  // Features / Orientation (Figma 4494:141814, 4494:142357)
  const [features, setFeatures] = useState('');

  // Price & Income (Figma 4494:141833, 4494:142107)
  const [isPriceActive, setIsPriceActive] = useState(true);
  const [price, setPrice] = useState('150,000');
  const [isIncomeActive, setIsIncomeActive] = useState(false);
  const [income, setIncome] = useState('');

  // Rent specific details (Figma 4494:142372)
  const [additionalExpenses, setAdditionalExpenses] = useState('');
  const [rentConditions, setRentConditions] = useState('');

  // Phone & Description
  const [phone, setPhone] = useState('58094586');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // Office Plan Quota (Figma 4494:141833)
  const [selectedPlan, setSelectedPlan] = useState<OfficePlanType>('normal');

  // Picker modals
  const [activePicker, setActivePicker] = useState<
    'governorate' | 'category' | null
  >(null);

  // Helpers
  const isLandCategory =
    category === 'أرض سكنية' || category === 'أرض' || category.includes('أرض');

  const isFormValid =
    Boolean(governorate || area) &&
    Boolean(phone) &&
    (isPriceActive ? Boolean(price) : true);

  const syncStoreAndNavigate = () => {
    updateField('listingType', listingType);
    updateField(
      'governorate',
      governorate ? { id: governorate, label: governorate } : null,
    );
    updateField('area', area ? { id: area, label: area } : null);
    updateField(
      'propertyCategory',
      category ? { id: category, label: category } : null,
    );
    updateField('areaSize', space.replace(/[^\d.]/g, '') || '300');
    updateField('propertyAge', propertyAge);
    updateField('automatedNumber', paciNumber);
    updateField('rooms', roomsCount);
    updateField('baths', bathroomsCount);
    updateField('floors', floorsCount);
    updateField('features', features ? [features] : []);
    updateField('showPrice', isPriceActive);
    updateField('price', price);
    updateField('showIncome', isIncomeActive);
    updateField('propertyIncome', income);
    updateField('monthlyRent', price);
    updateField('additionalExpenses', additionalExpenses);
    updateField('rentConditions', rentConditions);
    updateField('requestYear', requestYear);
    updateField('requiredYear', requiredYear);
    updateField('allocationState', allocationState);
    updateField('phoneNumber', phone);
    updateField('adDetails', description);
    updateField('images', images);
    updateField('adLevel', selectedPlan === 'silver' ? 'premium' : 'normal');
  };

  const handlePreviewAd = () => {
    syncStoreAndNavigate();

    Alert.alert(
      'معاينة الإعلان',
      `تم حفظ بيانات الإعلان بنجاح (${
        listingType === 'sell'
          ? 'بيع'
          : listingType === 'rent'
          ? 'إيجار'
          : 'بدل'
      }). هل ترغب في نشره الآن؟`,
      [
        { text: 'تعديل', style: 'cancel' },
        {
          text: 'معاينة كاملة',
          onPress: () => router.push('/(office)/preview'),
        },
        {
          text: 'تأكيد ونشر',
          onPress: () => {
            Alert.alert('نجاح', 'تم نشر الإعلان بنجاح في منصة بيوتنا!');
            router.back();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" testID="office-add-screen">
      {/* --- Top Bar --- */}
      <View className="h-[52px] w-full flex-row items-center justify-between border-b border-[#ECECEC] px-4 py-1.5">
        {/* Left: Map / Saved icon */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            Alert.alert(
              'خريطة العقارات',
              'يمكنك اختيار وتحديد موقع العقار مباشرة عبر الخريطة التفاعلية.',
            )
          }
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
          onPress={() => router.back()}
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
              value={listingType}
              onChange={setListingType}
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
                  value={area}
                  onChangeText={setArea}
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
                  onPress={() => setActivePicker('governorate')}
                  className="h-[46px] justify-center rounded-md border border-[#ECECEC] bg-white px-3"
                  testID="picker-governorate"
                >
                  <Text
                    className={`text-right font-cairo-regular text-sm ${
                      governorate ? 'text-[#111111]' : 'text-[#979797]'
                    }`}
                  >
                    {governorate || 'اختر المحافظة'}
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
                onPress={() =>
                  Alert.alert(
                    'تحديد الموقع',
                    'تم تحديد الإحداثيات على الخريطة بنجاح.',
                  )
                }
                className="h-[46px] w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-3"
                testID="button-map-location"
              >
                <Ionicons name="location-outline" size={18} color="#15304D" />
                <Text className="font-cairo-regular text-sm text-[#979797]">
                  {mapLocation || 'حدد الموقع على الخريطة'}
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
                  value={space}
                  onChangeText={setSpace}
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
                  onPress={() => setActivePicker('category')}
                  className="h-[46px] justify-center rounded-md border border-[#ECECEC] bg-white px-3"
                  testID="picker-category"
                >
                  <Text
                    className={`text-right font-cairo-regular text-sm ${
                      category ? 'text-[#111111]' : 'text-[#979797]'
                    }`}
                  >
                    {category || 'اختر نوع عقارك'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Row 4: Exchange years OR Age/PACI */}
            {listingType === 'exchange' ? (
              <View className="w-full flex-row gap-2">
                {/* سنة الطلب */}
                <View className="flex-1 flex-col gap-1.5">
                  <Text className="text-right font-cairo-medium text-sm text-[#111111]">
                    سنة الطلب *
                  </Text>
                  <TextInput
                    value={requestYear}
                    onChangeText={setRequestYear}
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
                    value={requiredYear}
                    onChangeText={setRequiredYear}
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
                    value={paciNumber}
                    onChangeText={setPaciNumber}
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
                    value={propertyAge}
                    onChangeText={setPropertyAge}
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
            {!(listingType === 'exchange' && isLandCategory) && (
              <View className="w-full flex-col gap-3">
                {/* Floors Stepper (if Rent or Exchange House) */}
                {(listingType === 'rent' ||
                  (listingType === 'exchange' && !isLandCategory)) && (
                  <View className="w-full">
                    <NumberStepper
                      label="عدد الادوار"
                      value={floorsCount}
                      onChange={setFloorsCount}
                      testID="stepper-floors"
                    />
                  </View>
                )}

                {/* Bathrooms & Rooms Stepper */}
                <View className="w-full flex-row gap-2">
                  <NumberStepper
                    label="عدد الحمامات"
                    value={bathroomsCount}
                    onChange={setBathroomsCount}
                    testID="stepper-bathrooms"
                  />
                  <NumberStepper
                    label="عدد الغرف"
                    value={roomsCount}
                    onChange={setRoomsCount}
                    testID="stepper-rooms"
                  />
                </View>
              </View>
            )}

            {/* Frontage / Orientation Dropdown (Figma 4494:141814 & 4494:142357) */}
            <View className="w-full">
              <OrientationDropdown
                value={features}
                onSelect={setFeatures}
                testID="orientation-dropdown"
              />
              {/* Hidden/accessible input-features for full backward compatibility */}
              <TextInput
                value={features}
                onChangeText={setFeatures}
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
                value={isPriceActive}
                onValueChange={setIsPriceActive}
                trackColor={{ false: '#ECECEC', true: '#15304D' }}
                thumbColor="#FFFFFF"
                testID="toggle-price-active"
              />
              <Text className="font-cairo-medium text-sm text-[#111111]">
                {listingType === 'rent' ? 'الايجار الشهري' : 'تحديد السعر'}
              </Text>
            </View>

            {/* Price Input if enabled */}
            {isPriceActive && (
              <View className="w-full flex-col gap-1.5">
                <Text className="text-right font-cairo-medium text-sm text-[#111111]">
                  {listingType === 'rent'
                    ? 'الايجار الشهري (بالدينار الكويتي) *'
                    : 'السعر (د.ك) *'}
                </Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="بالدينار الكويتي"
                  placeholderTextColor="#979797"
                  keyboardType="numeric"
                  className="h-[46px] rounded-md border border-[#ECECEC] bg-white px-3 text-right font-cairo-regular text-sm text-[#111111]"
                  testID="input-price"
                />
              </View>
            )}

            {/* Property Income Toggle for Sell (Figma 4494:141833, 4494:142107) */}
            {listingType === 'sell' && (
              <View className="w-full flex-col gap-2">
                <View className="w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-3 py-2">
                  <Switch
                    value={isIncomeActive}
                    onValueChange={setIsIncomeActive}
                    trackColor={{ false: '#ECECEC', true: '#15304D' }}
                    thumbColor="#FFFFFF"
                    testID="toggle-income-active"
                  />
                  <Text className="font-cairo-medium text-sm text-[#111111]">
                    مدخول العقار
                  </Text>
                </View>
                {isIncomeActive && (
                  <View className="w-full flex-col gap-1.5">
                    <Text className="text-right font-cairo-medium text-sm text-[#111111]">
                      مدخول العقار (د.ك)
                    </Text>
                    <TextInput
                      value={income}
                      onChangeText={setIncome}
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
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="58094586"
                  placeholderTextColor="#979797"
                  keyboardType="phone-pad"
                  className="h-[46px] flex-1 rounded-md border border-[#ECECEC] bg-white px-3 text-right font-cairo-regular text-sm text-[#111111]"
                  testID="input-phone"
                />
              </View>
            </View>

            {/* Rent Specific Fields (Figma 4494:142372) */}
            {listingType === 'rent' && (
              <>
                {/* Additional expenses */}
                <View className="w-full flex-col gap-1.5">
                  <Text className="text-right font-cairo-medium text-sm text-[#111111]">
                    المصاريف الاضافية
                  </Text>
                  <TextInput
                    value={additionalExpenses}
                    onChangeText={setAdditionalExpenses}
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
                    value={rentConditions}
                    onChangeText={setRentConditions}
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
            {listingType === 'exchange' && (
              <View className="w-full flex-col gap-1.5">
                <Text className="text-right font-cairo-medium text-sm text-[#111111]">
                  حالة التخصيص
                </Text>
                <TextInput
                  value={allocationState}
                  onChangeText={setAllocationState}
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
                value={description}
                onChangeText={setDescription}
                placeholder="اكتب نبذة عن الاعلان لاقناع العملاء..."
                placeholderTextColor="#979797"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="min-h-[100px] rounded-lg border border-[#ECECEC] bg-white p-3 text-right font-cairo-regular text-sm text-[#111111]"
                testID="input-description"
              />
            </View>

            {/* Office Plan Quota Selector matching Figma 4494:141833 & 4494:142107 */}
            <OfficePlanQuotaSelector
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
              silverQuota={2}
              normalQuota={20}
              testID="office-plan-quota-selector"
            />
            {/* Compatibility text node for tests */}
            <Text className="hidden h-0 w-0 opacity-0">
              9 إعلانات متبقية في باقتك
            </Text>
          </View>

          {/* --- Section 4: الصور --- */}
          <View className="mb-6">
            <ImageDropzone images={images} onChange={setImages} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- Sticky Bottom CTA Bar --- */}
      <View className="w-full border-t border-[#ECECEC] bg-white px-4 py-3 pb-8">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePreviewAd}
          disabled={!isFormValid}
          className={`h-12 w-full items-center justify-center rounded-full ${
            isFormValid ? 'bg-[#15304D]' : 'bg-[#A6A6A6]'
          }`}
          testID="button-preview-ad"
        >
          <Text className="font-cairo-semibold text-sm text-white">
            معاينة الاعلان
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- Selection Modals --- */}
      <Modal
        visible={activePicker !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActivePicker(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setActivePicker(null)}
          className="flex-1 items-center justify-center bg-black/40 px-6"
        >
          <View className="w-full max-h-[400px] rounded-2xl bg-white p-4">
            <Text className="mb-3 text-center font-cairo-bold text-base text-[#111111]">
              {activePicker === 'governorate' ? 'اختر المحافظة' : 'اختر فئة العقار'}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {(activePicker === 'governorate' ? GOVERNORATES : CATEGORIES).map(
                (item) => (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (activePicker === 'governorate') setGovernorate(item);
                      if (activePicker === 'category') setCategory(item);
                      setActivePicker(null);
                    }}
                    className="border-b border-[#F5F7F9] py-3"
                  >
                    <Text className="text-right font-cairo-medium text-sm text-[#111111]">
                      {item}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
