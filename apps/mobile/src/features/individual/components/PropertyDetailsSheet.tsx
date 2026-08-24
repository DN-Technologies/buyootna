import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
import { chatService } from '@/shared/api/chat.service';
import { SafeLinearGradient as LinearGradient } from '@/shared/components/SafeLinearGradient';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import {
  formatTimeAgo,
  getArabicCategoryLabel,
  getArabicTypeLabel,
} from '@/shared/utils/helpers/property';
import { PropertyDetailsDto } from '@/types/property';

interface PropertyDetailsSheetProps {
  property: PropertyDetailsDto | null;
  isFavorited?: boolean;
  onViewProperty?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
  onClose?: () => void;
  onWhatsAppPress?: () => void;
  onCallPress?: () => void;
  onChatPress?: () => void;
}

const PropertyDetailsSheet = forwardRef<
  BottomSheetModal,
  PropertyDetailsSheetProps
>(
  (
    {
      property,
      isFavorited = false,
      onViewProperty,
      onFavorite,
      onShare,
      onClose,
      onWhatsAppPress,
      onCallPress,
      onChatPress,
    },
    ref,
  ) => {
    const router = useRouter();
    const token = useAuthStore((state) => state.token);
    const snapPoints = useMemo(() => ['85%'], []);
    const [activeIndex, setActiveIndex] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

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

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const slideSize = event.nativeEvent.layoutMeasurement.width;
      if (slideSize > 0) {
        const index = event.nativeEvent.contentOffset.x / slideSize;
        setActiveIndex(Math.round(index));
      }
    };

    const handleWhatsApp = () => {
      if (onWhatsAppPress) {
        onWhatsAppPress();
        return;
      }
      const targetPhone =
        property?.phoneNumber || property?.phone || '96512345678';
      const cleanPhone = targetPhone.replace(/[^0-9+]/g, '');
      const waUrl = `whatsapp://send?phone=${cleanPhone}`;
      const webUrl = `https://wa.me/${cleanPhone}`;
      Linking.canOpenURL(waUrl)
        .then((supported) => {
          if (supported) {
            Linking.openURL(waUrl);
          } else {
            Linking.openURL(webUrl);
          }
        })
        .catch(() => {
          Linking.openURL(webUrl);
        });
    };

    const handleCall = () => {
      if (onCallPress) {
        onCallPress();
        return;
      }
      const targetPhone = property?.phoneNumber || property?.phone;
      if (!targetPhone) {
        showAlert('تنبيه', 'لا يوجد رقم هاتف متاح لهذا الإعلان');
        return;
      }
      const cleanPhone = targetPhone.replace(/[^0-9+]/g, '');
      Linking.openURL(`tel:${cleanPhone}`).catch(() => {
        showAlert('خطأ', 'تعذر إجراء المكالمة الهاتفية');
      });
    };

    const handleChat = async () => {
      if (onChatPress) {
        onChatPress();
        return;
      }
      if (!property?.id || !property?.host?.id) return;

      if (!token) {
        showAlert('تنبيه', 'يجب تسجيل الدخول لبدء محادثة');
        return;
      }

      try {
        const response = await chatService.createConversation(
          property.host.id,
          property.id,
        );
        onClose?.();
        router.push(`/chat/${response.id}`);
      } catch (error: any) {
        console.error('Failed to start chat conversation:', error);
        const backendMsg = error?.response?.data?.message;
        const msg = Array.isArray(backendMsg)
          ? backendMsg.join('\n')
          : backendMsg || 'تعذر بدء المحادثة مع البائع';
        showAlert('تنبيه', msg);
      }
    };

    const displayTitle = property
      ? `${getArabicCategoryLabel(property.category)} ${getArabicTypeLabel(property.type)}`
      : 'تفاصيل العقار';

    const formattedPrice =
      property && property.price && property.price > 0 ? (
        <Text className="font-cairo-bold text-2xl text-[#15304D]">
          {property.price.toLocaleString()}{' '}
          <Text className="font-cairo-semibold text-sm text-[#15304D]">
            د.ك
          </Text>
        </Text>
      ) : (
        <Text className="font-cairo-bold text-xl text-[#15304D]">
          السعر غير معلن
        </Text>
      );

    const displayImages =
      property?.images && property.images.length > 0
        ? property.images
        : [require('@/assets/images/no-image.png')];

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
                    <HeartIcon
                      color={isFavorited ? '#BA0003' : '#111111'}
                      size={16}
                      filled={isFavorited}
                    />
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
              {/* Main Content Container */}
              <View className="p-5">
                {/* 1. Property Image Carousel Container */}
                <View
                  onLayout={(e) => {
                    const width = e.nativeEvent.layout.width;
                    if (width > 0 && width !== containerWidth) {
                      setContainerWidth(width);
                    }
                  }}
                  className="relative mb-4 h-48 w-full overflow-hidden rounded-md bg-gray-100"
                >
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                  >
                    {displayImages.map((img, index) => (
                      <Image
                        key={index}
                        source={typeof img === 'string' ? { uri: img } : img}
                        style={{
                          width: containerWidth || 330,
                          height: '100%',
                        }}
                        contentFit="cover"
                      />
                    ))}
                  </ScrollView>

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

                  {/* Pagination Dots Overlay */}
                  {displayImages.length > 1 && (
                    <View className="absolute bottom-3 w-full flex-row items-center justify-center space-x-1.5 space-x-reverse">
                      {displayImages.map((_, index) => (
                        <View
                          key={index}
                          className={`h-1.5 rounded-full ${
                            activeIndex === index
                              ? 'w-4 bg-white'
                              : 'w-1.5 bg-white/60'
                          }`}
                        />
                      ))}
                    </View>
                  )}
                </View>

                {/* 2. Price and Views/Time Info Row */}
                <View className="mb-3 flex-row items-center justify-between">
                  {/* Price */}
                  <View className="items-start">{formattedPrice}</View>

                  {/* Views & Time */}
                  <View className="flex-row items-center gap-1.5">
                    <Text className="font-cairo-semibold text-xs text-[#6B6A6A]">
                      {formatTimeAgo(property.createdAt)} -
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <Feather name="eye" size={14} color="#6B6A6A" />
                      <Text className="font-cairo-semibold text-xs text-[#6B6A6A]">
                        {property.views || 0}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 3. Specs Row */}
                {(() => {
                  const specs = [];
                  const areaValue = property.areaSize || property.area;
                  if (areaValue) {
                    specs.push(
                      <View
                        key="area"
                        className="flex-row items-center gap-1.5"
                      >
                        <AreaIcon color="#15304D" size={17} />
                        <Text className="font-cairo-medium text-sm leading-[22px] text-[#111111]">
                          {areaValue} م²
                        </Text>
                      </View>,
                    );
                  }
                  if (
                    property.floors !== undefined &&
                    property.floors !== null
                  ) {
                    specs.push(
                      <View
                        key="floors"
                        className="flex-row items-center gap-1.5"
                      >
                        <FloorIcon color="#15304D" size={16} />
                        <Text className="font-cairo-medium text-sm leading-[22px] text-[#111111]">
                          {property.floors} دور
                        </Text>
                      </View>,
                    );
                  }
                  if (property.beds !== undefined && property.beds > 0) {
                    specs.push(
                      <View
                        key="beds"
                        className="flex-row items-center gap-1.5"
                      >
                        <BedIcon color="#15304D" size={16} />
                        <Text className="font-cairo-medium text-sm leading-[22px] text-[#111111]">
                          {property.beds} غرفة
                        </Text>
                      </View>,
                    );
                  }
                  if (property.baths !== undefined && property.baths > 0) {
                    specs.push(
                      <View
                        key="baths"
                        className="flex-row items-center gap-1.5"
                      >
                        <BathIcon color="#15304D" size={16} />
                        <Text className="font-cairo-medium text-sm leading-[22px] text-[#111111]">
                          {property.baths} حمام
                        </Text>
                      </View>,
                    );
                  }

                  return (
                    <View className="mb-4 flex-row items-center justify-between px-1 py-2">
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

                {/* 4. Location & Additional Details */}
                <View className="mb-4 items-start gap-2.5">
                  {/* Location */}
                  {property.location && (
                    <View className="flex-row items-start gap-2">
                      <LocationIcon color="#15304D" size={18} />
                      <Text
                        className="flex-1 font-cairo-semibold text-sm leading-[20px] text-[#111111]"
                        style={{ writingDirection: 'rtl' }}
                      >
                        {property.location}
                      </Text>
                    </View>
                  )}

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
                        <Text className="font-cairo-semibold text-xs text-[#018B1B]">
                          د.ك
                        </Text>
                      </View>
                    )}

                  {/* License Number */}
                  {property.licenseNumber && (
                    <View className="flex-row items-center gap-2">
                      <LicenseIcon color="#15304D" size={18} />
                      <Text className="font-cairo-medium text-sm text-[#111111]">
                        رقم الرخصة {property.licenseNumber}
                      </Text>
                    </View>
                  )}
                </View>

                {/* 5. Description Section */}
                {Boolean(property.description) && (
                  <View className="mb-5 items-start">
                    <Text className="mb-1 font-cairo-bold text-base text-[#6B6A6A]">
                      الوصف
                    </Text>
                    <Text
                      className="font-cairo text-sm leading-6 text-[#111111]"
                      style={{ writingDirection: 'rtl' }}
                    >
                      {property.description}
                    </Text>
                  </View>
                )}

                {/* 6. Contact Action Buttons Bar */}
                <View className="mb-5 flex-row items-center justify-start gap-4">
                  {/* Call Button (Navy Border) */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleCall}
                    className="h-12 w-20 items-center justify-center rounded-full border border-[#15304D]"
                  >
                    <CallIcon color="#15304D" size={16} />
                  </TouchableOpacity>

                  {/* WhatsApp Button (Green Border) */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleWhatsApp}
                    className="h-12 w-20 items-center justify-center rounded-full border border-[#60D669]"
                  >
                    <WhatsappIcon size={20} />
                  </TouchableOpacity>

                  {/* Chat Button (Gold Border) */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleChat}
                    className="h-12 w-20 items-center justify-center rounded-full border border-[#B28648]"
                  >
                    <ChatIcon color="#B28648" size={18} />
                  </TouchableOpacity>
                </View>

                {/* 7. View Property CTA Button */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={onViewProperty}
                  className="h-12 w-full items-center justify-center rounded-full bg-[#15304D]"
                >
                  <Text className="font-cairo-semibold text-sm leading-[22px] text-white">
                    عرض العقار
                  </Text>
                </TouchableOpacity>
              </View>
            </BottomSheetScrollView>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

PropertyDetailsSheet.displayName = 'PropertyDetailsSheet';

export default PropertyDetailsSheet;
