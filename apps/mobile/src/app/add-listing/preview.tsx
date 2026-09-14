import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { plansService, PublishOption } from '@/shared/api/plans.service';
import { propertiesService } from '@/shared/api/properties.service';
import PlanSlotPickerSheet from '@/shared/components/add-listing/PlanSlotPickerSheet';
import QuotaExhaustedSheet from '@/shared/components/add-listing/QuotaExhaustedSheet';
import SuccessModal from '@/shared/components/add-listing/SuccessModal';
import { useListingStore } from '@/shared/store/useListingStore';
import { showAlert } from '@/shared/utils/alert';

// Helper component for the two-column grid items
const PreviewItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | null;
}) => (
  <View className="flex-1 items-start">
    <Text className="text-right font-cairo-medium text-[12px] text-[#A0A0A0]">
      {label}
    </Text>
    <Text className="text-right font-cairo-bold text-[14px] text-[#15304D]">
      {value || '-'}
    </Text>
  </View>
);

export default function AdPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const slotPickerRef = useRef<BottomSheetModal>(null);
  const quotaSheetRef = useRef<BottomSheetModal>(null);
  const [publishOptions, setPublishOptions] = useState<PublishOption[]>([]);
  const [quotaSheetMode, setQuotaSheetMode] = useState<
    'exhausted' | 'featuredUnavailable'
  >('exhausted');

  // Pull data from global state
  const draftData = useListingStore();
  const {
    isSubmitting,
    setSubmitting,
    setSubmissionError,
    buildApiPayload,
    resetForm,
  } = useListingStore();

  // State for success sheet
  const [showSuccess, setShowSuccess] = useState(false);

  // Mapping helpers
  const listingTypeLabel =
    draftData.listingType === 'sell'
      ? 'بيع'
      : draftData.listingType === 'rent'
        ? 'إيجار'
        : 'بدل';

  const adLevelLabel =
    draftData.adLevel === 'premium' ? 'إعلان مميز' : 'إعلان عادي';

  const submitListing = async (
    isDraft: boolean,
    planSlotId?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setSubmitting(true);
      setSubmissionError(null);

      let uploadedUrls: string[] = [];
      if (draftData.images.length > 0) {
        uploadedUrls = await propertiesService.uploadImages(draftData.images);
      }

      const payload = buildApiPayload(isDraft, uploadedUrls, planSlotId);
      await propertiesService.createProperty(payload);

      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'حدث خطأ غير متوقع';

      const axiosError = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const backendMessage = axiosError?.response?.data?.message;
      const displayMessage = Array.isArray(backendMessage)
        ? backendMessage.join('\n')
        : backendMessage || errorMessage;

      setSubmissionError(displayMessage);
      return { success: false, error: displayMessage };
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const optionsRes = await plansService.getPublishOptions();

      if (!optionsRes.canPublish || optionsRes.options.length === 0) {
        setQuotaSheetMode('exhausted');
        quotaSheetRef.current?.present();
        return;
      }

      // Featured status is granted by the plan slot a property publishes
      // from (slot.featuredDays), not by this screen's "نوع الاعلان"
      // choice on its own -- so when the user picked Featured, only offer
      // slots that actually carry featured days, instead of silently
      // publishing on a slot that would make it a regular ad.
      const wantsFeatured = draftData.adLevel === 'premium';
      const eligibleOptions = wantsFeatured
        ? optionsRes.options.filter((option) => option.featuredDays > 0)
        : optionsRes.options;

      if (eligibleOptions.length === 0) {
        setQuotaSheetMode('featuredUnavailable');
        quotaSheetRef.current?.present();
        return;
      }

      if (eligibleOptions.length === 1) {
        const res = await submitListing(false, eligibleOptions[0].slotId);
        if (res.success) {
          setShowSuccess(true);
        } else {
          showAlert('خطأ', res.error || 'فشل في إضافة الإعلان');
        }
        return;
      }

      setPublishOptions(eligibleOptions);
      slotPickerRef.current?.present();
    } catch (e) {
      console.error('Failed to check publish options:', e);
      showAlert('خطأ', 'فشل في التحقق من رصيد الإعلانات');
    }
  };

  const handleSlotSelected = async (slotId: string) => {
    slotPickerRef.current?.dismiss();
    const res = await submitListing(false, slotId);
    if (res.success) {
      setShowSuccess(true);
    } else {
      showAlert('خطأ', res.error || 'فشل في إضافة الإعلان');
    }
  };

  const handleSaveDraft = async () => {
    const res = await submitListing(true);
    if (res.success) {
      showAlert('تم الحفظ', 'تم حفظ الإعلان كمسودة بنجاح', [
        {
          text: 'حسناً',
          onPress: () => {
            resetForm();
            router.replace('/home');
          },
        },
      ]);
    } else {
      showAlert('خطأ', res.error || 'فشل في حفظ المسودة', [
        { text: 'حسناً' },
      ]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* --- Loading Overlay --- */}
      {isSubmitting && (
        <View
          className="absolute inset-0 z-50 items-center justify-center bg-black/40"
          style={{ zIndex: 50 }}
        >
          <View className="items-center rounded-2xl bg-white px-10 py-8 shadow-xl">
            <ActivityIndicator size="large" color="#15304D" />
            <Text className="mt-4 font-cairo-semibold text-[15px] text-[#15304D]">
              جاري رفع الإعلان...
            </Text>
          </View>
        </View>
      )}

      {/* --- 1. Header --- */}
      <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full"
          activeOpacity={0.7}
        >
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-bold text-lg text-[#111111]">
          معاينة الاعلان
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        <View className="px-5 pt-4">
          {/* Subtitle */}
          <Text
            className="mb-4 font-cairo-medium text-[13px] text-[#8C8C8C]"
            style={{ writingDirection: 'rtl' }}
          >
            هذه معاينة لكيف سيظهر إعلانك للمستخدمين
          </Text>

          {/* --- 2. Details Card matching Figma 619:17698 --- */}
          <View className="mb-6 rounded-xl border border-gray-100 bg-[#FAFAFA] p-4">
            {/* Row 1: نوع الاعلان */}
            <View className="mb-4 flex-row">
              <PreviewItem label="نوع الاعلان" value={listingTypeLabel} />
            </View>

            {/* Row 2: فئة العقار & المساحة */}
            <View className="mb-4 flex-row gap-4" style={{ gap: 16 }}>
              <PreviewItem
                label="فئة العقار"
                value={draftData.propertyCategory?.label}
              />
              <PreviewItem
                label="المساحة"
                value={draftData.areaSize ? `${draftData.areaSize} م²` : '-'}
              />
            </View>

            {/* Row 3: عمر العقار / سنة الطلب */}
            {draftData.listingType === 'exchange' ? (
              <View className="mb-4 flex-row gap-4" style={{ gap: 16 }}>
                <PreviewItem label="سنة الطلب" value={draftData.requestYear} />
                <PreviewItem label="السنة المطلوبة" value={draftData.requiredYear} />
              </View>
            ) : (
              <View className="mb-4 flex-row gap-4" style={{ gap: 16 }}>
                <PreviewItem
                  label="عمر العقار"
                  value={
                    draftData.propertyAge ? `${draftData.propertyAge} سنوات` : '-'
                  }
                />
                <PreviewItem
                  label="الرقم الالي للعقار"
                  value={draftData.automatedNumber}
                />
              </View>
            )}

            {/* Row 4: الحمامات & الغرف & الأدوار */}
            <View className="mb-4 flex-row gap-4" style={{ gap: 16 }}>
              {draftData.listingType !== 'sell' && (
                <PreviewItem label="عدد الادوار" value={draftData.floors} />
              )}
              <PreviewItem label="عدد الحمامات" value={draftData.baths} />
              <PreviewItem label="عدد الغرف" value={draftData.rooms} />
            </View>

            {/* Row 5: المزايا & رقم الهاتف */}
            <View className="mb-4 flex-row gap-4" style={{ gap: 16 }}>
              <PreviewItem
                label="المزايا"
                value={draftData.features?.join('، ') || '-'}
              />
              <PreviewItem label="رقم الهاتف" value={draftData.phoneNumber} />
            </View>

            {/* Row 6: Pricing / Rent / Allocation Details */}
            {draftData.listingType === 'rent' ? (
              <View className="mb-4 flex-row gap-4" style={{ gap: 16 }}>
                <PreviewItem
                  label="الايجار الشهري"
                  value={draftData.monthlyRent ? `${draftData.monthlyRent} د.ك` : 'غير محدد'}
                />
                {draftData.additionalExpenses ? (
                  <PreviewItem
                    label="المصاريف الاضافية"
                    value={draftData.additionalExpenses}
                  />
                ) : null}
              </View>
            ) : draftData.listingType === 'exchange' ? (
              draftData.allocationState ? (
                <View className="mb-4 items-start">
                  <Text className="mb-1 text-right font-cairo-medium text-[12px] text-[#A0A0A0]">
                    حالة التخصيص
                  </Text>
                  <Text className="text-right font-cairo-bold text-[14px] text-[#15304D]">
                    {draftData.allocationState}
                  </Text>
                </View>
              ) : null
            ) : draftData.showPrice && draftData.price ? (
              <View className="mb-4 flex-row">
                <PreviewItem label="السعر" value={`${draftData.price} د.ك`} />
              </View>
            ) : null}

            {/* Row 7: الموقع */}
            <View className="mb-4 items-start">
              <Text className="mb-1 text-right font-cairo-medium text-[12px] text-[#A0A0A0]">
                الموقع
              </Text>
              <Text className="text-right font-cairo-semibold text-[14px] text-[#15304D]">
                {draftData.mapLocationLabel
                  ? draftData.mapLocationLabel
                  : `${draftData.governorate?.label || ''} - ${draftData.area?.label || ''}`}
              </Text>
            </View>

            {/* Row 8: تفاصيل الاعلان */}
            <View className="mb-4 w-full items-start">
              <Text className="mb-1 text-right font-cairo-medium text-[12px] text-[#A0A0A0]">
                تفاصيل الاعلان
              </Text>
              <Text
                className="font-cairo-semibold text-[13px] leading-6 text-[#15304D]"
                style={{ writingDirection: 'rtl' }}
              >
                {draftData.adDetails || 'لا يوجد تفاصيل.'}
              </Text>
            </View>

            {/* Row 9: نوع الاعلان */}
            <View className="items-start">
              <Text className="mb-1 text-right font-cairo-medium text-[12px] text-[#A0A0A0]">
                نوع الاعلان
              </Text>
              <Text className="text-right font-cairo-bold text-[14px] text-[#15304D]">
                {adLevelLabel}
              </Text>
            </View>
          </View>

          {/* --- 3. Image Preview --- */}
          <View className="w-full">
            <Text
              className="pb-2 font-cairo-medium text-[13px] text-[#A0A0A0]"
              style={{ writingDirection: 'rtl' }}
            >
              الصور
            </Text>
            {draftData.images.length > 0 ? (
              <Image
                source={{ uri: draftData.images[0] }}
                className="h-52 w-full rounded-2xl"
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require('@/assets/images/no-image.png')}
                className="h-52 w-full rounded-2xl"
                resizeMode="cover"
              />
            )}

            {draftData.images.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-3"
                contentContainerStyle={{ flexDirection: 'row-reverse', gap: 10 }}
              >
                {draftData.images.slice(1).map((uri, idx) => (
                  <Image
                    key={idx}
                    source={{ uri }}
                    className="h-16 w-16 rounded-xl border border-gray-100"
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>

      {/* --- 4. Sticky Footer Actions matching Figma 619:17698 --- */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="flex-row gap-3">
          {/* Solid Publish Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={{ flex: 1.3 }}
            className={`h-[50px] items-center justify-center rounded-full ${
              isSubmitting ? 'bg-[#15304D]/60' : 'bg-[#15304D]'
            }`}
          >
            <Text className="font-cairo-bold text-[15px] text-white">
              إضافة الاعلان
            </Text>
          </TouchableOpacity>

          {/* Outlined Save as Draft Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSaveDraft}
            disabled={isSubmitting}
            style={{ flex: 1 }}
            className={`h-[50px] items-center justify-center rounded-full border border-[#D1D5DB] ${
              isSubmitting ? 'bg-gray-100' : 'bg-white'
            }`}
          >
            <Text className="font-cairo-bold text-[15px] text-[#111111]">
              حفظ كمسودة
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- 5. Modals & Sheets --- */}
      <SuccessModal
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      <PlanSlotPickerSheet
        ref={slotPickerRef}
        options={publishOptions}
        onSelectSlot={handleSlotSelected}
      />

      <QuotaExhaustedSheet
        ref={quotaSheetRef}
        onBrowsePackages={() => router.push('/plans')}
        title={
          quotaSheetMode === 'featuredUnavailable'
            ? 'ليس لديك باقة تشمل إعلانات مميزة'
            : undefined
        }
        description={
          quotaSheetMode === 'featuredUnavailable'
            ? 'لتتمكن من نشر هذا الإعلان كإعلان مميز والحصول على أولوية الظهور، يرجى شراء باقة تشمل أيام إعلان مميز.'
            : undefined
        }
      />
    </SafeAreaView>
  );
}
