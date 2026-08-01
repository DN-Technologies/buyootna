import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  DimensionValue,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
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
import { SafeLinearGradient } from '@/shared/components/SafeLinearGradient';
export interface PropertyCardProps {
  id: string;
  images: (string | number)[];
  price: number | string;
  companyName: string;
  isFeatured?: boolean;
  type?: string; // e.g., 'سكني'
  area: number;
  beds: number;
  baths: number;
  location: string;
  timeAgo?: string;
  cardWidth?: DimensionValue; // Allow custom width for horizontal scrolling
  phone?: string | null;
  onPress?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
  onWhatsAppPress?: () => void;
  onCallPress?: () => void;
  onChatPress?: () => void;
}

export default function PropertyCard({
  id,
  images,
  price,
  companyName,
  isFeatured = false,
  type = 'سكني',
  area,
  beds,
  baths,
  location,
  timeAgo = 'منذ ساعتين',
  cardWidth = '100%',
  phone,
  onPress,
  onFavorite,
  onShare,
  onWhatsAppPress,
  onCallPress,
  onChatPress,
}: PropertyCardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [measuredWidth, setMeasuredWidth] = useState(0);

  const fallbackWidth = windowWidth - 40;
  const imageWidth =
    typeof cardWidth === 'number' ? cardWidth : measuredWidth || fallbackWidth;

  // Update pagination dots when scrolling images
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveIndex(Math.round(index));
  };

  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/property/${id}`);
    }
  };

  const handleWhatsApp = () => {
    if (onWhatsAppPress) {
      onWhatsAppPress();
      return;
    }
    const targetPhone = phone || '96512345678';
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
    const targetPhone = phone;
    if (!targetPhone) {
      Alert.alert('تنبيه', 'لا يوجد رقم هاتف متاح لهذا الإعلان');
      return;
    }
    const cleanPhone = targetPhone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('خطأ', 'تعذر إجراء المكالمة الهاتفية');
    });
  };

  const handleChat = () => {
    if (onChatPress) {
      onChatPress();
      return;
    }
    router.push(`/chat/${id}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      className="mb-5 w-full overflow-hidden rounded-md border border-gray-200 bg-white"
      onLayout={(e) => {
        const { width } = e.nativeEvent.layout;
        if (width > 0 && width !== measuredWidth) {
          setMeasuredWidth(width);
        }
      }}
      style={{
        width: cardWidth, // Applies the 75% width when inside a horizontal list
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
    >
      {/* --- 1. Image Carousel Section --- */}
      {(() => {
        const displayImages =
          images && images.length > 0
            ? images
            : [require('@/assets/images/no-image.png')];
        return (
          <View className="relative h-48 w-full">
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
                    width: imageWidth,
                    height: '100%',
                  }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

        {/* Absolute Top Right: Badges */}
        <View className="absolute right-3 top-3 flex-row gap-2">
          {isFeatured && (
            <SafeLinearGradient
              colors={['#FF8D28', '#FACC15']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                width: 55,
                height: 25,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 10,
                borderBottomRightRadius: 10,
                borderBottomLeftRadius: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text className="font-almarai text-[12px] leading-[14.4px] text-[#111111]">
                مميز
              </Text>
            </SafeLinearGradient>
          )}
        </View>

        {/* Absolute Top Left: Actions (Heart & Share) */}
        <View className="absolute left-3 top-3 flex-row gap-2">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onFavorite}
            style={{
              height: 25,
              minWidth: 25,
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 8,
            }}
          >
            <HeartIcon color="#111111" size={16} />
          </TouchableOpacity>
        </View>

        {/* Absolute Bottom: Pagination Dots */}
        <View className="absolute bottom-3 w-full flex-row items-center justify-center space-x-1.5 space-x-reverse">
          {displayImages.map((_, index) => (
            <View
              key={index}
              className={`h-1.5 rounded-full ${activeIndex === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </View>
        <View className="absolute bottom-0 left-0 right-0 h-2 w-full rounded-t-[40px] bg-white" />
      </View>
        );
      })()}

      {/* --- 2. Content Info Section --- */}
      <View className="px-4 py-2">
        {/* Price & Company Row */}
        <View className="mb-3 flex-row justify-between">
          <View className="items-start">
            <Text className="font-cairo-bold text-xl text-[#111111]">
              {typeof price === 'number' ? (
                <>
                  {price.toLocaleString()}{' '}
                  <Text className="font-cairo-semibold text-sm text-[#6B6A6A]">
                    د.ك
                  </Text>
                </>
              ) : (
                price
              )}
            </Text>
            <Text className="mt-1 font-cairo-semibold text-xs text-[#6B6A6A]">
              {companyName}
            </Text>
          </View>
          <Text className="mt-1.5 font-cairo-semibold text-xs text-[#6B6A6A]">
            {timeAgo}
          </Text>
        </View>

        {/* Specs Row (Area, Beds, Baths) */}
        <View className="mb-2 flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Text className="font-cairo-semibold text-sm text-[#111111]">
              شقة{type ? ` ${type}` : ''} •
            </Text>
            <Text className="font-cairo-semibold text-sm text-[#111111]">
              {area} م²
            </Text>
          </View>

          <View className="h-3 w-[1px] bg-[#111111]" />

          <View className="flex-row items-center gap-1.5">
            <BedIcon color="#111111" size={16} />
            <Text className="text-sm font-normal text-[#111111]">{beds}</Text>
          </View>

          <View className="h-3 w-[1px] bg-[#111111]" />

          <View className="flex-row items-center gap-1.5">
            <BathIcon color="#111111" size={16} />
            <Text className="text-sm font-normal text-[#111111]">{baths}</Text>
          </View>
        </View>

        {/* Location Row */}
        <View className="mb-1 flex-row items-center gap-1.5">
          <LocationIcon color="#6B6A6A" size={16} />
          <Text
            className="font-cairo-medium text-sm leading-[23px] text-[#6B6A6A]"
            numberOfLines={1}
          >
            {location}
          </Text>
        </View>

        {/* --- 3. Action Buttons Footer --- */}
        <View className="flex-row items-center justify-between gap-2 pt-2">
          {/* WhatsApp Button (Green Outline) */}
          <TouchableOpacity
            className="h-10 flex-1 flex-row items-center justify-center rounded-[24px] border border-[#60D669]"
            activeOpacity={0.7}
            onPress={handleWhatsApp}
          >
            <WhatsappIcon size={20} />
          </TouchableOpacity>

          {/* Phone Button (Gray Outline) */}
          <TouchableOpacity
            className="h-10 flex-1 flex-row items-center justify-center rounded-[24px] border border-[#15304D]"
            activeOpacity={0.7}
            onPress={handleCall}
          >
            <CallIcon color="#15304D" size={16} />
          </TouchableOpacity>

          {/* Message/Chat Button (Gold Outline) */}
          <TouchableOpacity
            className="h-10 flex-1 flex-row items-center justify-center rounded-[24px] border border-[#B28648]"
            activeOpacity={0.7}
            onPress={handleChat}
          >
            <ChatIcon color="#B28648" size={18} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
