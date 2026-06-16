import { Feather } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  <View className="flex-1 items-start">
    <Text className="text-right font-cairo-medium text-[12px] text-[#A0A0A0]">
      {label}
    </Text>
    <Text className="text-right font-cairo-bold text-[13px] text-[#15304D]">
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
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-8 w-8 items-center justify-center"
        >
          <ExpoImage
            source={require('@/assets/icons/arrow-back.svg')}
            style={{ width: 12, height: 16 }}
          />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-lg text-[#111111]">
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
          <Text
            className="mb-2 font-cairo-medium text-[12px] text-[#A0A0A0]"
            style={{ writingDirection: 'rtl' }}
          >
            هذه معاينة لكيف سيظهر إعلانك للمستخدمين
          </Text>

          {/* --- 2. Details Card --- */}
          <View className="mb-6">
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

            {/* Row 3: عمر العقار & الرقم الالي للعقار */}
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

            {/* Row 4: عدد الحمامات & عدد الغرف & عدد الأدوار */}
            <View className="mb-4 flex-row gap-4" style={{ gap: 16 }}>
              {draftData.propertyCategory?.id !== 'apartment' && (
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

            {/* Full Width Rows */}
            <View className="mb-4 items-start">
              <Text className="mb-1 text-right font-cairo-medium text-[12px] text-[#A0A0A0]">
                الموقع
              </Text>
              <Text className="text-right font-cairo-semibold text-[13px] text-[#15304D]">
                {draftData.governorate?.label} - {draftData.area?.label}
              </Text>
            </View>

            <View className="mb-4 w-full items-start">
              <Text className="mb-1 text-right font-cairo-medium text-[12px] text-[#A0A0A0]">
                تفاصيل الاعلان
              </Text>
              <Text
                className="font-cairo-semibold text-[13px] text-[#15304D]"
                style={{ writingDirection: 'rtl' }}
              >
                {draftData.adDetails || 'لا يوجد تفاصيل.'}
              </Text>
            </View>

            <View className="items-start">
              <Text className="mb-1 text-right font-cairo-medium text-[12px] text-[#A0A0A0]">
                نوع الاعلان
              </Text>
              <Text className="text-right font-cairo-bold text-[13px] text-[#15304D]">
                {adLevelLabel}
              </Text>
            </View>
          </View>

          {/* --- 3. Image Preview --- */}
          <View className="w-full">
            <Text
              className="pb-1 font-cairo-medium text-[12px] text-[#A0A0A0]"
              style={{ writingDirection: 'rtl' }}
            >
              الصور
            </Text>
            {draftData.images.length > 0 ? (
              <Image
                source={{ uri: draftData.images[0] }}
                className="h-48 w-full rounded-xl"
                resizeMode="cover"
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
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>

      {/* --- 4. Sticky Footer Actions --- */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <View className="flex-row gap-3">
          {/* Solid Publish Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={{ flex: 1.3 }}
            className={`h-12 items-center justify-center rounded-full ${
              isSubmitting ? 'bg-[#15304D]/60' : 'bg-[#15304D]'
            }`}
          >
            <Text className="font-cairo-semibold text-[14px] text-white">
              إضافة الاعلان
            </Text>
          </TouchableOpacity>

          {/* Outlined Save as Draft Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSaveDraft}
            disabled={isSubmitting}
            style={{ flex: 1 }}
            className={`h-12 items-center justify-center rounded-full border border-[#E2E8F0] ${
              isSubmitting ? 'bg-gray-100' : 'bg-white'
            }`}
          >
            <Text className="font-cairo-semibold text-[14px] text-[#111111]">
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
