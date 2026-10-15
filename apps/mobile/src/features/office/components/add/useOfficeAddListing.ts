import { useQuery } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { groupWalletSlots } from '@/features/individual/utils/planWallet';
import { OfficeListingType } from '@/features/office/types';
import { plansService } from '@/shared/api/plans.service';
import { useContactPhonePrefill } from '@/shared/hooks/auth/useContactPhonePrefill';
import { useListingStore } from '@/shared/store/useListingStore';
import {
  categoryOptionsFor,
  getCategoryFields,
} from '@/shared/utils/data/propertyCategories';

import type { OfficePlanType } from './OfficePlanQuotaSelector';

export const OFFICE_GOVERNORATES = [
  'العاصمة',
  'حولي',
  'الفروانية',
  'الأحمدي',
  'الجهراء',
  'مبارك الكبير',
];

export type OfficePickerKey = 'governorate' | 'category' | null;

/**
 * إضافة إعلان's form state and flow for the office persona: property
 * details, price/income, plan quota (driven by the office's REAL wallet —
 * QA: quota counters must never be hardcoded), images, and the preview
 * hand-off through the shared listing store.
 */
export function useOfficeAddListing() {
  const router = useRouter();
  const updateField = useListingStore((state) => state.updateField);
  // The per-category block writes straight to the shared store: start it
  // clear rather than with another form's leftovers
  const resetCategoryDetails = useListingStore(
    (state) => state.resetCategoryDetails,
  );
  useEffect(() => {
    resetCategoryDetails();
  }, [resetCategoryDetails]);

  // Form State
  const [listingType, setListingTypeState] =
    useState<OfficeListingType>('sell');
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
  // Starts on the office's contact number (never a made-up one)
  const [phone, setPhone] = useState('');
  useContactPhonePrefill(phone, setPhone);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // Office Plan Quota (Figma 4494:141833)
  const [selectedPlan, setSelectedPlan] = useState<OfficePlanType>('normal');

  // Picker modals
  const [activePicker, setActivePicker] = useState<OfficePickerKey>(null);

  // Real office wallet (QA: quota counters must reflect the actual balance,
  // not literals). GET /plans/wallet is identity-scoped and role-agnostic,
  // so it serves the office persona's free ads and plan-tier slots too.
  const { data: wallet, isLoading: isWalletLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => plansService.getWallet(),
    staleTime: 0,
  });
  const walletTiers = useMemo(
    () => groupWalletSlots(wallet?.slots ?? []),
    [wallet],
  );
  const normalQuota =
    walletTiers.find((tier) => tier.planSlug === 'normal')?.adsRemaining ?? 0;
  const silverQuota =
    walletTiers.find((tier) => tier.planSlug === 'silver')?.adsRemaining ?? 0;
  const totalQuota = normalQuota + silverQuota;

  // The same categories and per-category fields as the individual flow
  const categoryOptions = categoryOptionsFor(listingType);
  const selectedCategory =
    categoryOptions.find((option) => option.label === category) ?? null;
  const categoryFields = getCategoryFields(selectedCategory?.id);

  // A category the new type doesn't offer (e.g. شقة under بدل) is dropped
  const setListingType = (type: OfficeListingType) => {
    setListingTypeState(type);
    if (!categoryOptionsFor(type).some((option) => option.label === category)) {
      setCategory('');
    }
  };

  // An office's sale or rent ad must state its price (Ministry of Commerce,
  // December 2024): the price toggle can't skip it there
  const priceRequired = listingType !== 'exchange';
  const isFormValid =
    Boolean(governorate || area) &&
    Boolean(phone) &&
    (isPriceActive || priceRequired ? Boolean(price) : true) &&
    // Publishing requires ad credits; unknown (still loading) doesn't block
    (isWalletLoading ? true : totalQuota > 0);

  const selectPickerItem = (item: string) => {
    if (activePicker === 'governorate') setGovernorate(item);
    if (activePicker === 'category') setCategory(item);
    setActivePicker(null);
  };

  const showMapLocationAlert = () =>
    Alert.alert(
      'تحديد الموقع',
      'تم تحديد الإحداثيات على الخريطة بنجاح.',
    );

  const showMapInfoAlert = () =>
    Alert.alert(
      'خريطة العقارات',
      'يمكنك اختيار وتحديد موقع العقار مباشرة عبر الخريطة التفاعلية.',
    );

  const syncStoreAndNavigate = () => {
    updateField('listingType', listingType);
    updateField(
      'governorate',
      governorate ? { id: governorate, label: governorate } : null,
    );
    updateField('area', area ? { id: area, label: area } : null);
    updateField(
      'propertyCategory',
      selectedCategory
        ? { id: selectedCategory.id, label: selectedCategory.label }
        : null,
    );
    updateField('areaSize', space.replace(/[^\d.]/g, '') || '300');
    updateField('propertyAge', propertyAge);
    updateField('automatedNumber', paciNumber);
    updateField('rooms', roomsCount);
    updateField('baths', bathroomsCount);
    updateField('floors', floorsCount);
    updateField('features', features ? [features] : []);
    updateField('showPrice', priceRequired || isPriceActive);
    updateField('price', price);
    updateField('showIncome', isIncomeActive);
    // A building's income on a rent / exchange ad comes from the category
    // block (already in the store); a sale's from the income toggle here
    if (listingType === 'sell') updateField('propertyIncome', income);
    updateField('monthlyRent', price);
    updateField('additionalExpenses', additionalExpenses);
    updateField('rentConditions', rentConditions);
    updateField('requestYear', requestYear);
    updateField('requiredYear', requiredYear);
    // Land keeps its حالة التخصيص from the category block
    if (listingType === 'exchange') {
      updateField('allocationState', allocationState);
    }
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

  return {
    // Navigation
    goBack: () => router.back(),
    showMapInfoAlert,
    // Listing type
    listingType,
    setListingType,
    // Location & property info
    governorate,
    setGovernorate,
    area,
    setArea,
    mapLocation,
    showMapLocationAlert,
    category,
    setCategory,
    space,
    setSpace,
    propertyAge,
    setPropertyAge,
    paciNumber,
    setPaciNumber,
    // Exchange years
    requestYear,
    setRequestYear,
    requiredYear,
    setRequiredYear,
    allocationState,
    setAllocationState,
    // Features / orientation
    features,
    setFeatures,
    // Steppers
    roomsCount,
    setRoomsCount,
    bathroomsCount,
    setBathroomsCount,
    floorsCount,
    setFloorsCount,
    categoryFields,
    // Price & income
    priceRequired,
    isPriceActive,
    setIsPriceActive,
    price,
    setPrice,
    isIncomeActive,
    setIsIncomeActive,
    income,
    setIncome,
    // Contact & description
    phone,
    setPhone,
    description,
    setDescription,
    // Rent-specific details
    additionalExpenses,
    setAdditionalExpenses,
    rentConditions,
    setRentConditions,
    // Images
    images,
    setImages,
    // Plan quota (real wallet)
    selectedPlan,
    setSelectedPlan,
    normalQuota,
    silverQuota,
    totalQuota,
    isWalletLoading,
    // Pickers
    activePicker,
    setActivePicker,
    selectPickerItem,
    pickerOptions: activePicker === 'governorate'
      ? OFFICE_GOVERNORATES
      : categoryOptions.map((option) => option.label),
    pickerTitle:
      activePicker === 'governorate' ? 'اختر المحافظة' : 'فئة العقار',
    // Submit
    isFormValid,
    handlePreviewAd,
  };
}

/** Everything the office إضافة إعلان sections read and change. */
export type OfficeAddListing = ReturnType<typeof useOfficeAddListing>;
