import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import {
  AreaIcon,
  BathIcon,
  BedIcon,
  CloseIcon,
  FloorIcon,
  LicenseIcon,
  LocationIcon,
  ShareIcon,
} from '@/assets/icons/home/property';
import {
  getArabicCategoryLabel,
  getArabicTypeLabel,
} from '@/core/utils/helpers/property';
import { ActivityItem } from '@/hooks/useMyActivity';

interface DraftPreviewSheetProps {
  property?: ActivityItem;
  onClose?: () => void;
  onDeletePress?: () => void;
  onEditPress?: () => void;
}

const DraftPreviewSheet = forwardRef<BottomSheetModal, DraftPreviewSheetProps>(
  ({ property, onClose, onDeletePress, onEditPress }, ref) => {
    // Snap points: 85% of screen height provides a comprehensive viewing sheet
    const snapPoints = useMemo(() => ['85%'], []);

    // Local toggle state for the publish switch (purely interactive UI placeholder)
    const [isPublished, setIsPublished] = useState(false);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    const handleClose = () => {
      // @ts-ignore
      ref.current?.dismiss();
      if (onClose) onClose();
    };

    if (!property) return null;

    // Fallback cover image
    const coverImage =
      property.images?.[0] || 'https://via.placeholder.com/400x250?text=No+Image';

    // Construct label like "شقة للبيع" or "عقار تجاري للبيع"
    const displayLabel = `${getArabicCategoryLabel(property.category)} ${getArabicTypeLabel(property.type as any)}`;

    // Publication Date formatting
    const displayDate = '15 مايو 2026';

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 40 }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      >
        {/* --- Fixed Header (Outside scroll container so it stays sticky) --- */}
        <View className="flex-row items-center justify-between px-6 pb-4 border-b border-gray-100">
          {/* Right Header Title */}
          <Text className="font-cairo-bold text-lg text-[#111111]">
            {displayLabel}
          </Text>
          {/* Left Actions: Close, Share, Publish Toggle */}
          <View className="flex-row items-center gap-3">
            {/* Local Switch Toggle (Publish Switch) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsPublished(!isPublished)}
            >
              <View
                className="w-11 h-6 rounded-full p-0.5 justify-center"
                style={{
                  backgroundColor: isPublished ? '#15304D' : '#E2E8F0',
                  alignItems: isPublished ? 'flex-start' : 'flex-end',
                }}
              >
                <View className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              className="h-8 w-8 items-center justify-center rounded-full"
            >
              <ShareIcon size={18} color="#111111" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleClose}
              className="h-8 w-8 items-center justify-center rounded-full"
            >
              <CloseIcon size={20} color="#111111" />
            </TouchableOpacity>

          </View>
        </View>

        {/* --- Scrollable Body Content --- */}
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          {/* Cover image area */}
          <View className="px-6 my-4">
            <View className="relative h-[210px] w-full overflow-hidden rounded-sm bg-gray-50">
              <Image
                source={{ uri: coverImage }}
                className="h-full w-full"
                resizeMode="cover"
              />

              {/* Mock premium tag */}
              {property.isPremium && (
                <View className="absolute left-4 top-4 rounded-lg bg-[#FA9E1B] px-3 py-1.5 shadow-sm">
                  <Text className="font-cairo-bold text-[11px] text-[#111111]">
                    التميز نشط حتى 25 مايو
                  </Text>
                </View>
              )}

              {/* Pagination Dots */}
              <View className="absolute bottom-4 left-0 right-0 flex-row justify-center items-center gap-1.5">
                <View className="h-1.5 w-1.5 rounded-full bg-white/40" />
                <View className="h-1.5 w-1.5 rounded-full bg-white/40" />
                <View className="h-1.5 w-4 rounded-full bg-[#15304D]" />
              </View>
            </View>
          </View>

          {/* Price & Date Row */}
          <View className="px-6 flex-row items-center justify-between mb-4">
            <View className="flex-row items-baseline gap-1">
              <Text className="font-bold text-2xl text-[#15304D]">
                {property.price ? property.price.toLocaleString() : '---'}
              </Text>
              <Text className="font-cairo-semibold text-sm text-[#6B6A6A]">
                د.ك
              </Text>
            </View>
                <Text className="font-cairo text-xs text-[#6B6A6A]">
                   تاريخ النشر: {displayDate}
                </Text>
          </View>

          {/* Specifications Row */}
          <View className="px-6 flex-row items-center justify-between py-3 border-y border-gray-100 mb-4">
            {/* Area size */}
            <View className="flex-1 flex-row items-center justify-center gap-1.5">
              <AreaIcon size={16} color="#6B6A6A" />
              <Text className="font-cairo leading-[22px] text-sm text-[#111111]">200 م٢</Text>
            </View>

            <View className="h-4 w-[1px] bg-gray-200" />

            {/* Floor number */}
            <View className="flex-1 flex-row items-center justify-center gap-1.5">
              <FloorIcon size={16} color="#6B6A6A" />
              <Text className="font-cairo text-sm leading-[22px] text-[#111111]">4 دور</Text>
            </View>

            <View className="h-4 w-[1px] bg-gray-200" />

            {/* Bedrooms count */}
            <View className="flex-1 flex-row items-center justify-center gap-1.5">
              <BedIcon size={16} color="#6B6A6A" />
              <Text className="font-cairo text-sm leading-[22px] text-[#111111]">3 غرف</Text>
            </View>

            <View className="h-4 w-[1px] bg-gray-200" />

            {/* Bathrooms count */}
            <View className="flex-1 flex-row items-center justify-center gap-1.5">
              <BathIcon size={16} color="#6B6A6A" />
              <Text className="font-cairo text-sm leading-[22px] text-[#111111]">2 حمام</Text>
            </View>
          </View>

          {/* Location row */}
          <View className="px-6 mb-4">
            <Text className="font-cairo-semibold text-xs text-[#6B6A6A] mb-1.5"
            style={{writingDirection: "rtl"}}
            >
              الموقع
            </Text>
            <View className="flex-row items-center gap-1.5">
              <LocationIcon size={18} color="#15304D" />
              <Text className="font-cairo leading-[22px] text-sm text-[#111111] text-right">
                {property.location || 'السالمية، شارع 2، بناية 10، شقة 4'}
              </Text>
            </View>
          </View>

          {/* Features Row */}
          <View className="px-6 mb-4">
            <Text className="font-cairo-semibold text-xs text-[#6B6A6A] mb-2"
            style={{writingDirection: "rtl"}}
            >
              مزايا العقار
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {['جراج', 'مصعد', 'شارع واحد'].map((tag) => (
                <View
                  key={tag}
                  className="rounded-lg bg-[#F8FAFC] border border-gray-100 px-3 py-1"
                >
                  <Text className="font-cairo text-xs leading-[22px] text-[#111111]">{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* License Badge Row */}
          <View className="px-6 mb-4 flex-row items-center gap-1.5">
            <LicenseIcon size={16} color="#6B6A6A" />
            <Text className="font-cairo text-xs leading-[22px] text-[#6B6A6A]">
              رقم الرخصة {property.automatedNumber || '2454685'}
            </Text>
          </View>

          {/* Description Block */}
          <View className="px-6 mb-6">
            <Text className="font-cairo-semibold text-xs text-[#6B6A6A] mb-1.5"
            style={{writingDirection: "rtl"}}
            >
              الوصف
            </Text>
            <Text className="font-cairo text-sm leading-6 text-[#111111]" style={{writingDirection: "rtl"}}>
              {property.description ||
                'شقة فاخرة للبيع في قلب السالمية، تتميز بتصميم معماري حديث وتشطيبات سوبر لوكس. الشقة تقع في الدور الـ 4 مما يوفر إطلالة بانورامية على الخليج العربي. موقع البرج حيوي جداً وقريب من المجمعات التجارية والخدمات الرئيسية.'}
            </Text>
          </View>

          {/* Stats Container */}
          <View className="mx-6 mb-6 flex-row items-center justify-around rounded-2xl bg-[#F8FAFC] border border-gray-100 py-3 px-2">
            {/* Views Column */}
            <View className="flex-1 items-center">
              <Text className="mb-0.5 font-cairo text-[11px] text-[#6B6A6A]">
                عدد المشاهدات
              </Text>
              <Text className="font-cairo-bold text-[14px] text-[#15304D]">50</Text>
            </View>

            {/* Separator */}
            <View className="h-7 w-[1px] bg-gray-200" />

            {/* Saves Column */}
            <View className="flex-1 items-center">
              <Text className="mb-0.5 font-cairo text-[11px] text-[#6B6A6A]">
                مرات الحفظ
              </Text>
              <Text className="font-cairo-bold text-[14px] text-[#15304D]">80</Text>
            </View>

            {/* Separator */}
            <View className="h-7 w-[1px] bg-gray-200" />

            {/* Contact Clicks Column */}
            <View className="flex-1 items-center">
              <Text className="mb-0.5 font-cairo text-[11px] text-[#6B6A6A]">
                عدد التواصل
              </Text>
              <Text className="font-cairo-bold text-[14px] text-[#15304D]">4</Text>
            </View>
          </View>

          {/* Action Buttons Row */}
          <View className="px-6 flex-row items-center gap-3 mb-8">
            {/* Solid Edit Button (Right side, takes 50% width) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                handleClose();
                if (onEditPress) onEditPress();
              }}
              className="h-[40px] flex-1 items-center justify-center rounded-full bg-[#15304D]"
            >
              <Text className="font-cairo-semibold text-sm text-white leading-[22px]">تعديل</Text>
            </TouchableOpacity>

            {/* Outline Feature Button (Middle, takes 30% width) */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="h-[40px] flex-1 items-center justify-center rounded-full border border-[#B28648] bg-white"
            >
              <Text className="font-cairo-semibold text-sm text-[#B28648] leading-[22px]">تمييز</Text>
            </TouchableOpacity>

            {/* Outline Delete Button (Left side, takes 20% width) */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                handleClose();
                if (onDeletePress) onDeletePress();
              }}
              className="h-[40px] flex-1 items-center justify-center rounded-full border border-[#9C1E28] bg-white"
            >
              <Text className="font-cairo-semibold text-sm text-[#9C1E28] leading-[22px]">حذف</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

DraftPreviewSheet.displayName = 'DraftPreviewSheet';

export default DraftPreviewSheet;
