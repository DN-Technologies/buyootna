import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { propertiesService } from '@/core/api/properties.service';
import SuccessModal from '@/core/components/add-listing/SuccessModal';
import { useListingStore } from '@/core/store/useListingStore';

// Helper component for the two-column grid items
const PreviewItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | null;
}) => (
  <View className="flex-1 items-end">
    <Text className="mb-1 text-right font-cairo-medium text-xs text-[#94A3B8]">
      {label}
    </Text>
    <Text className="text-right font-cairo-semibold text-[15px] text-[#111111]">
      {value || '-'}
    </Text>
  </View>
);

export default function AdPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Pull all data from our global state
  const draftData = useListingStore();
  const {
    isSubmitting,
    setSubmitting,
    setSubmissionError,
    buildApiPayload,
    resetForm,
  } = useListingStore();

  // Local state for the success modal
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

  /**
   * Core submission logic shared between publish and draft.
   * 1. Upload images to S3
   * 2. Build API payload
   * 3. Create property on backend
   */
  const submitListing = async (isDraft: boolean) => {
    try {
      setSubmitting(true);
      setSubmissionError(null);

      // Step 1: Upload images (if any) to get S3 URLs
      let uploadedUrls: string[] = [];
      if (draftData.images.length > 0) {
        uploadedUrls = await propertiesService.uploadImages(draftData.images);
      }

      // Step 2: Build the API payload from the Zustand store
      const payload = buildApiPayload(isDraft, uploadedUrls);

      // Step 3: Send to backend
      await propertiesService.createProperty(payload);

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'حدث خطأ غير متوقع';

      // Try to extract the backend validation message
      const axiosError = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const backendMessage = axiosError?.response?.data?.message;
      const displayMessage = Array.isArray(backendMessage)
        ? backendMessage.join('\n')
        : backendMessage || errorMessage;

      setSubmissionError(displayMessage);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const success = await submitListing(false);
    if (success) {
      setShowSuccess(true);
    } else {
      Alert.alert('خطأ', draftData.submissionError || 'فشل في إضافة الإعلان', [
        { text: 'حسناً' },
      ]);
    }
  };

  const handleSaveDraft = async () => {
    const success = await submitListing(true);
    if (success) {
      Alert.alert('تم الحفظ', 'تم حفظ الإعلان كمسودة بنجاح', [
        {
          text: 'حسناً',
          onPress: () => {
            resetForm();
            router.replace('/(main)/home');
          },
        },
      ]);
    } else {
      Alert.alert('خطأ', draftData.submissionError || 'فشل في حفظ المسودة', [
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
      <View className="flex-row items-center justify-between border-b border-gray-100 px-5 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-8 w-8 items-center justify-center"
        >
          <Image
            source={require('@/assets/icons/arrow-back.svg')}
            style={{ width: 12, height: 16 }}
          />
        </TouchableOpacity>
        <Text className="font-cairo-bold text-lg text-[#111111]">
          معاينة الإعلان
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <View className="px-5 pt-6">
          {/* Subtitle */}
          <Text className="mb-6 text-center font-cairo-medium text-sm text-[#64748B]">
            هذه معاينة لكيف سيظهر إعلانك للمستخدمين
          </Text>

          {/* --- 2. Details Card --- */}
          <View className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            {/* Row 1 */}
            <View className="mb-4 flex-row gap-4" style={{ gap: 16 }}>
              <PreviewItem label="المساحة" value={`${draftData.areaSize} م²`} />
              <PreviewItem label="نوع الاعلان" value={listingTypeLabel} />
            </View>

            {/* Row 2 */}
            <View className="mb-4 flex-row gap-4" style={{ gap: 16 }}>
              <PreviewItem
                label="عمر العقار"
                value={
                  draftData.propertyAge ? `${draftData.propertyAge} سنوات` : '-'
                }
              />
              <PreviewItem
                label="فئة العقار"
                value={draftData.propertyCategory?.label}
              />
            </View>

            {/* Row 3 */}
            <View className="mb-4 flex-row gap-4" style={{ gap: 16 }}>
              <PreviewItem label="عدد الحمامات" value={draftData.baths} />
              <PreviewItem
                label="الرقم الالي للعقار"
                value={draftData.automatedNumber}
              />
            </View>

            {/* Row 4 */}
            <View className="mb-4 flex-row gap-4" style={{ gap: 16 }}>
              <PreviewItem label="رقم الهاتف" value={draftData.phoneNumber} />
              <PreviewItem label="عدد الغرف" value={draftData.rooms} />
            </View>

            {/* Divider */}
            <View className="my-2 border-t border-gray-100" />

            {/* Full Width Rows */}
            <View className="mb-4 mt-4 items-end">
              <Text className="mb-1 text-right font-cairo-medium text-xs text-[#94A3B8]">
                الموقع
              </Text>
              <Text className="text-right font-cairo-semibold text-[15px] text-[#111111]">
                {draftData.governorate?.label} - {draftData.area?.label}{' '}
                {draftData.mapLocation ? `(${draftData.mapLocation})` : ''}
              </Text>
            </View>

            <View className="mb-4 w-full items-end">
              <Text className="mb-1 text-right font-cairo-medium text-xs text-[#94A3B8]">
                تفاصيل الاعلان
              </Text>
              <Text className="text-right font-cairo-semibold text-[14px] leading-6 text-[#111111]">
                {draftData.adDetails || 'لا يوجد تفاصيل.'}
              </Text>
            </View>

            <View className="items-end">
              <Text className="mb-1 text-right font-cairo-medium text-xs text-[#94A3B8]">
                نوع اعلانك
              </Text>
              <Text className="text-right font-cairo-bold text-[15px] text-[#111111]">
                {adLevelLabel}
              </Text>
            </View>
          </View>

          {/* --- 3. Image Preview --- */}
          <View className="mb-8 w-full">
            <Text
              className="mb-3 pb-2 font-cairo-semibold text-base text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              الصور
            </Text>
            {draftData.images.length > 0 ? (
              <Image
                source={{ uri: draftData.images[0] }}
                className="h-48 w-full rounded-xl"
                contentFit="cover"
              />
            ) : (
              <View className="h-48 w-full items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                <Feather name="image" size={32} color="#D1D5DB" />
                <Text className="mt-2 font-cairo-medium text-gray-400">
                  لا توجد صور
                </Text>
              </View>
            )}

            {/* Additional Image Thumbnails (if any) */}
            {draftData.images.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-3"
                contentContainerStyle={{ flexDirection: 'row-reverse' }}
              >
                {draftData.images.slice(1).map((uri, idx) => (
                  <Image
                    key={idx}
                    source={{ uri }}
                    className="ml-3 h-16 w-16 rounded-lg"
                    contentFit="cover"
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>

      {/* --- 4. Sticky Footer Actions --- */}
      <View
        className="absolute bottom-0 w-full border-t border-gray-100 bg-white px-5 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <View className="flex-col gap-3" style={{ gap: 12 }}>
          {/* Solid Publish Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`h-12 w-full items-center justify-center rounded-lg ${
              isSubmitting ? 'bg-[#15304D]/60' : 'bg-[#15304D]'
            }`}
          >
            <Text className="font-cairo-bold text-[15px] text-white">
              إضافة الاعلان
            </Text>
          </TouchableOpacity>

          {/* Outlined Save as Draft Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSaveDraft}
            disabled={isSubmitting}
            className={`h-12 w-full items-center justify-center rounded-lg border border-[#15304D] ${
              isSubmitting ? 'bg-gray-100' : 'bg-white'
            }`}
          >
            <Text className="font-cairo-bold text-[15px] text-[#15304D]">
              حفظ كمسودة
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- 5. Success Modal --- */}
      <SuccessModal
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </SafeAreaView>
  );
}
