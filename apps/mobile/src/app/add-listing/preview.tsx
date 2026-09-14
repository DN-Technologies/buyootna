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

export default function AdPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    draftData,
    isSubmitting,
    slotPickerRef,
    quotaSheetRef,
    publishOptions,
    showSuccess,
    setShowSuccess,
    createdPropertyId,
    handleSubmit,
    handleSlotSelected,
    handleSaveDraft,
  } = useSubmitListing();

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
          <PreviewDetailsCard draftData={draftData} />

          {/* --- 3. Image Preview --- */}
          <PreviewImageGallery images={draftData.images} />
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
        propertyId={createdPropertyId}
      />

      <PlanSlotPickerSheet
        ref={slotPickerRef}
        options={publishOptions}
        onSelectSlot={handleSlotSelected}
      />

      <QuotaExhaustedSheet
        ref={quotaSheetRef}
        onBrowsePackages={() => router.push('/plans')}
      />
    </SafeAreaView>
  );
}
