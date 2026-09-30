import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import PlanSlotPickerSheet from '@/shared/components/add-listing/PlanSlotPickerSheet';
import PreviewDetailsCard from '@/shared/components/add-listing/PreviewDetailsCard';
import PreviewImageGallery from '@/shared/components/add-listing/PreviewImageGallery';
import QuotaExhaustedSheet from '@/shared/components/add-listing/QuotaExhaustedSheet';
import SuccessModal from '@/shared/components/add-listing/SuccessModal';
import { useSubmitListing } from '@/shared/hooks/useSubmitListing';

export default function OfficeAdPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    draftData,
    isSubmitting,
    slotPickerRef,
    quotaSheetRef,
    publishOptions,
    quotaSheetMode,
    showSuccess,
    setShowSuccess,
    createdPropertyId,
    handleSubmit,
    handleSlotSelected,
    handleSaveDraft,
  } = useSubmitListing();

  return (
    <SafeAreaView className="flex-1 bg-white" testID="office-preview-screen">
      {/* --- Loading Overlay --- */}
      {isSubmitting && (
        <View
          className="absolute inset-0 z-50 items-center justify-center bg-black/40"
          style={{ zIndex: 50 }}
          testID="submitting-overlay"
        >
          <View className="items-center rounded-2xl bg-white px-10 py-8 shadow-xl">
            <ActivityIndicator size="large" color="#15304D" />
            <Text className="mt-4 font-cairo-semibold text-[15px] text-[#15304D]">
              جاري رفع الإعلان...
            </Text>
          </View>
        </View>
      )}

      {/* --- 1. Header matching Figma 4494:142685 --- */}
      <View className="h-[52px] w-full flex-row items-center justify-between border-b border-[#ECECEC] px-4 py-1.5">
        <View className="w-8" />
        <Text className="font-cairo-semibold text-lg text-[#111111]">
          معاينة الاعلان
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]"
          activeOpacity={0.7}
          testID="preview-back-button"
          accessibilityLabel="رجوع"
        >
          <Feather name="arrow-right" size={20} color="#111111" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <View className="px-4 pt-3">
          {/* Subtitle matching Figma 4494:142685 */}
          <Text
            className="mb-4 text-right font-cairo-medium text-[13px] text-[#8C8C8C]"
            style={{ writingDirection: 'rtl' }}
          >
            هذه معاينة لكيف سيظهر إعلانك للمستخدمين
          </Text>

          {/* Details Card */}
          <PreviewDetailsCard draftData={draftData} />

          {/* Uploaded Images Gallery */}
          <PreviewImageGallery images={draftData.images} />
        </View>
      </ScrollView>

      {/* --- Sticky Footer Actions matching Figma 4494:142685 --- */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-[#ECECEC] bg-white px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        testID="preview-footer-actions"
      >
        <View className="w-full flex-row gap-3">
          {/* Outlined Save as Draft Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSaveDraft}
            disabled={isSubmitting}
            style={{ flex: 1 }}
            className={`h-12 items-center justify-center rounded-full border border-[#E2E8F0] ${
              isSubmitting ? 'bg-gray-100' : 'bg-white'
            }`}
            testID="button-save-draft"
          >
            <Text className="font-cairo-semibold text-[14px] text-[#111111]">
              حفظ كمسودة
            </Text>
          </TouchableOpacity>

          {/* Solid Publish Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={{ flex: 1.4 }}
            className={`h-12 items-center justify-center rounded-full ${
              isSubmitting ? 'bg-[#15304D]/60' : 'bg-[#15304D]'
            }`}
            testID="button-confirm-publish"
          >
            <Text className="font-cairo-semibold text-[14px] text-white">
              إضافة الاعلان
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- Success Modal matching Figma 4494:142831 --- */}
      <SuccessModal
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
        propertyId={createdPropertyId}
      />

      {/* Plan slot picker & Quota exhausted sheets */}
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
