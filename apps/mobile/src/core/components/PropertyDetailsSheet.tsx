import { Feather, FontAwesome } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import {
  BathIcon,
  BedIcon,
  CallIcon,
  ChatIcon,
  HeartIcon,
  LocationIcon,
  WhatsappIcon,
} from '@/assets/icons/home/cards';
import {
  AreaIcon,
  CloseIcon,
  FloorIcon,
  IncomeIcon,
  LicenseIcon,
  ShareIcon,
} from '@/assets/icons/home/property';
import {
  formatTimeAgo,
  getArabicCategoryLabel,
  getArabicTypeLabel,
} from '@/core/utils/helpers/property';
import { PropertyDetailsDto } from '@/types/property';

interface PropertyDetailsSheetProps {
  property: PropertyDetailsDto | null;
  onViewProperty?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
  onClose?: () => void;
}

const PropertyDetailsSheet = forwardRef<
  BottomSheetModal,
  PropertyDetailsSheetProps
>(({ property, onViewProperty, onFavorite, onShare, onClose }, ref) => {
  const snapPoints = useMemo(() => ['85%'], []);

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

  const displayTitle = property
    ? `${getArabicCategoryLabel(property.category)} ${getArabicTypeLabel(property.type)}`
    : 'تفاصيل العقار';

  const formattedPrice =
    property && property.price && property.price > 0 ? (
      <Text className="font-cairo-bold text-2xl text-[#15304D]">
        {property.price.toLocaleString()}{' '}
        <Text className="font-cairo-semibold text-sm text-[#15304D]">د.ك</Text>
      </Text>
    ) : (
      <Text className="font-cairo-bold text-xl text-[#15304D]">
        السعر غير معلن
      </Text>
    );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 40 }}
      backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
    >
      <BottomSheetView className="flex-1">
        {/* Header Row */}
        <View
          className="flex-row items-center justify-between border-b border-gray-100 px-5 pb-3 pt-2"
          style={{ flexDirection: 'row' }}
        >
          {/* Title (Right Side) */}
          <Text className="font-cairo-semibold text-lg text-[#111111]">
            {displayTitle}
          </Text>
          {/* Actions (Left Side) */}
          <View className="flex-row items-center gap-3">
            {property && (
              <>
                {/* Favorite */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onFavorite}
                  className="h-8 w-8 items-center justify-center rounded-full"
                >
                  <HeartIcon color="#111111" size={16} />
                </TouchableOpacity>
                {/* Share */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onShare}
                  className="h-8 w-8 items-center justify-center rounded-full"
                >
                  <ShareIcon color="#111111" size={16} />
                </TouchableOpacity>
              </>
            )}
            {/* Close */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full"
            >
              <CloseIcon color="#111111" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {!property ? (
          <View className="flex-1 items-center justify-center py-10">
            <ActivityIndicator size="large" color="#15304D" />
            <Text className="mt-4 font-cairo text-sm text-[#6B6A6A]">
              جاري تحميل التفاصيل...
            </Text>
          </View>
        ) : (
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
          >
          {/* Main Content */}
          <View className="p-5">
            {/* Property Image Container */}
            <View className="relative mb-4 h-48 w-full overflow-hidden rounded-md bg-gray-100">
              <Image
                source={
                  property.images && property.images.length > 0
                    ? property.images[0]
                    : 'https://via.placeholder.com/600x400'
                }
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />

              {/* Featured Badge */}
              {property.isFeatured && (
                <View className="absolute right-3 top-3">
                  <LinearGradient
                    colors={['#FF8D28', '#FACC15']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={{
                      width: 48,
                      paddingHorizontal: 8,
                      height: 20,
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 10,
                      borderBottomRightRadius: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text className="font-almarai text-[12px] leading-[120%] text-[#111111]">
                      مميز
                    </Text>
                  </LinearGradient>
                </View>
              )}
            </View>

            {/* Views and Time Info */}
            <View className="flex-row items-center justify-between">
              {/* Price */}
              <View className="mb-4 items-start">{formattedPrice}</View>
              <View className="mb-2 flex-row items-center gap-3">
                <Text className="font-cairo-semibold text-[12px] text-[#6B6A6A]">
                  {formatTimeAgo(property.createdAt)}
                </Text>
                <View className="h-3 w-[1px] bg-gray-200" />
                <View className="flex-row items-center gap-1.5">
                  <Feather name="eye" size={14} color="#6B6A6A" />
                  <Text className="font-cairo-semibold text-[12px] leading-[20px] text-[#6B6A6A]">
                    {property.views || 0}
                  </Text>
                </View>
              </View>
            </View>

            {/* Specs Row */}
            {(() => {
              const specs = [];
              specs.push(
                <View key="area" className="flex-row items-center gap-1.5">
                  <AreaIcon color="#15304D" size={17} />
                  <Text className="font-cairo-medium text-sm leading-[22px] text-[#111111]">
                    {property.areaSize} م²
                  </Text>
                </View>,
              );
              if (property.floors !== undefined) {
                specs.push(
                  <View key="floors" className="flex-row items-center gap-1.5">
                    <FloorIcon color="#15304D" size={16} />
                    <Text className="font-cairo-medium text-sm leading-[22px] text-[#111111]">
                      {property.floors} دور
                    </Text>
                  </View>,
                );
              }
              if (property.beds !== undefined && property.beds > 0) {
                specs.push(
                  <View key="beds" className="flex-row items-center gap-1.5">
                    <BedIcon color="#15304D" size={16} />
                    <Text className="font-cairo-medium text-sm leading-[22px] text-[#111111]">
                      {property.beds} غرف
                    </Text>
                  </View>,
                );
              }
              if (property.baths !== undefined && property.baths > 0) {
                specs.push(
                  <View key="baths" className="flex-row items-center gap-1.5">
                    <BathIcon color="#15304D" size={16} />
                    <Text className="font-cairo-medium text-sm leading-[22px] text-[#111111]">
                      {property.baths} حمام
                    </Text>
                  </View>,
                );
              }

              // Render with dividers in between
              return (
                <View className="mb-4 flex-row items-center justify-between px-1 py-3">
                  {specs.reduce((acc, spec, index) => {
                    if (index === 0) return [spec];
                    return [
                      ...acc,
                      <View
                        key={`divider-${index}`}
                        className="h-4 w-[1px] bg-gray-200"
                      />,
                      spec,
                    ];
                  }, [] as React.ReactNode[])}
                </View>
              );
            })()}

            {/* Details & Location Info */}
            <View className="mb-6 items-start gap-3">
              {/* Location */}
              <View className="flex-row items-start gap-2">
                <LocationIcon color="#15304D" size={18} />
                <Text className="font-cairo-semibold text-sm leading-[20px] text-[#111111]">
                  {property.location}
                </Text>
              </View>

              {/* Income */}
              {property.propertyIncome !== undefined &&
                property.propertyIncome !== null && (
                  <View className="flex-row items-center gap-1.5">
                    <IncomeIcon color="#15304D" size={18} />
                    <Text className="font-cairo text-sm text-[#111111]">
                      مدخول العقار:
                    </Text>
                    <Text className="font-cairo-bold text-base text-[#018B1B]">
                      {property.propertyIncome.toLocaleString()}
                    </Text>
                    <Text className="font-cairo-semibold text-[12px] text-[#018B1B]">
                      د.ك
                    </Text>
                  </View>
                )}

              {/* License */}
              {property.licenseNumber && (
                <View className="flex-row items-center gap-2">
                  <LicenseIcon color="#15304D" size={18} />
                  <Text className="font-cairo-medium text-sm text-[#111111]">
                    رقم الرخصة: {property.licenseNumber}
                  </Text>
                </View>
              )}
            </View>

            {/* Host/Owner Profile snippet */}
            {property.host && (
              <View className="mb-6 flex-row items-start justify-between gap-3 rounded-md bg-[#F9FAFE] p-4">
                {/* Column 1: Logo/Avatar (Rightmost in RTL) */}
                <Image
                  source={
                    property.host.avatarUrl
                      ? property.host.avatarUrl
                      : 'https://via.placeholder.com/150'
                  }
                  style={{ width: 56, height: 56, borderRadius: 28 }}
                />

                {/* Column 2: Title, Description, Icons (Middle) */}
                <View className="flex-1 items-start pr-3">
                  <Text className="text-right font-cairo-semibold text-[16px] text-[#111111]">
                    {property.host.name}
                  </Text>
                  <Text className="text-right font-cairo text-[13px] text-[#6B6A6A]">
                    مضيف في بيوتنا منذ {property.host.joinedDate}
                  </Text>

                  {/* Actions Row */}
                  <View className="mt-3 flex-row items-center gap-2.5">
                    {/* Call */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      className="h-10 w-10 items-center justify-center rounded-full border border-[#15304D]"
                    >
                      <CallIcon color="#15304D" size={16} />
                    </TouchableOpacity>

                    {/* WhatsApp */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      className="h-10 w-10 items-center justify-center rounded-full border border-[#60D669]"
                    >
                      <WhatsappIcon size={20} />
                    </TouchableOpacity>

                    {/* Chat */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      className="h-10 w-10 items-center justify-center rounded-full border border-[#B28648]"
                    >
                      <ChatIcon color="#B28648" size={16} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Column 3: Rate & Arrow (Leftmost in RTL) */}
                <View className="h-20 items-center justify-between py-1 pl-1">
                  {/* Host Rating */}
                  <View className="flex-row items-center gap-1">
                    <FontAwesome name="star" size={14} color="#F59E0B" />
                    <Text className="text-sm font-medium leading-[22px] text-[#111111]">
                      {property.host.rating || '3.5'}
                    </Text>
                  </View>

                  {/* Chevron left */}
                  <Feather
                    name="chevron-left"
                    size={20}
                    color="#6B6A6A"
                    style={{
                      alignSelf: 'flex-end',
                      position: 'absolute',
                      bottom: -20,
                    }}
                  />
                </View>
              </View>
            )}

            {/* View Property CTA */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onViewProperty}
              className="h-12 w-full items-center justify-center rounded-full bg-[#15304D]"
            >
              <Text className="font-cairo-semibold text-[14px] leading-[22px] text-white">
                عرض العقار
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      )}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

PropertyDetailsSheet.displayName = 'PropertyDetailsSheet';

export default PropertyDetailsSheet;
