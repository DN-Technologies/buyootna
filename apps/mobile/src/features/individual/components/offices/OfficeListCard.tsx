import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import {
  CallIcon,
  ChatIcon,
  HeartIcon,
  LocationIcon,
} from '@/assets/icons/home/cards';
import { BuildingOutlineIcon } from '@/assets/icons/office-home';
import { showAlert } from '@/shared/utils/alert';
import { openChatWith } from '@/shared/utils/openChat';
import { openUrlThrottled } from '@/shared/utils/openUrl';

const DEAL_TAGS: Record<string, string> = {
  RENT: 'إيجار',
  SALE: 'بيع',
  EXCHANGE: 'بدل',
};

// إيجار / بيع / بدل for the deals it has live ads in, then "N خدمة"
export function officeTags(listingTypes: string[], servicesCount: number) {
  const tags = ['RENT', 'SALE', 'EXCHANGE']
    .filter((t) => listingTypes.includes(t))
    .map((t) => DEAL_TAGS[t]);
  if (servicesCount > 0) tags.push(`${servicesCount} خدمة`);
  return tags;
}

export interface OfficeListCardProps {
  id: string;
  name: string;
  rating?: number;
  reviewsCount?: number;
  location?: string;
  logoUrl?: string;
  isVerified?: boolean;
  isFavorite?: boolean;
  propertiesCount?: number;
  services?: string[];
  // From the API card: the deal types of its live ads and its services count
  listingTypes?: string[];
  servicesCount?: number;
  phone?: string | null;
  whatsapp?: string | null;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  onChatPress?: () => void;
}

export default function OfficeListCard({
  id,
  name,
  rating = 0,
  reviewsCount = 0,
  location,
  logoUrl,
  isVerified = true,
  isFavorite = false,
  propertiesCount = 0,
  services,
  listingTypes = [],
  servicesCount = 0,
  phone,
  whatsapp,
  onPress,
  onToggleFavorite,
  onChatPress,
}: OfficeListCardProps) {
  const router = useRouter();

  const handleCall = () => {
    if (!phone) {
      showAlert('تنبيه', 'لا يوجد رقم هاتف متاح لهذا المكتب');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    openUrlThrottled(`tel:${cleanPhone}`).catch(() => {
      showAlert('خطأ', 'تعذر إجراء المكالمة الهاتفية');
    });
  };

  // Starts a chat with the office; screens that need a sign-in check pass
  // their own onChatPress
  const handleChat = () => {
    if (onChatPress) {
      onChatPress();
      return;
    }
    openChatWith(router, { recipientId: id });
  };

  const displayTags =
    services && services.length > 0
      ? services
      : officeTags(listingTypes, servicesCount);

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      className="mb-4 w-full rounded-2xl border border-gray-100/90 bg-white p-4"
      style={{
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      }}
    >
      {/* Row 1: Logo & Name/Location (Right in RTL) + Heart (Left in RTL) */}
      <View className="flex-row items-start justify-between gap-3">
        {/* Right in RTL: Logo & Information */}
        <View className="flex-1 flex-row items-center gap-3">
          {/* Logo Squircle */}
          <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-[#1D2B4F]">
            {logoUrl ? (
              <Image
                source={{ uri: logoUrl }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            ) : (
              <MaterialCommunityIcons
                name="home-city-outline"
                size={30}
                color="#B28648"
              />
            )}
          </View>

          {/* Name & Location */}
          <View className="flex-1">
            {/* A long name truncates instead of pushing the badge onto the
                heart */}
            <View className="flex-row items-center gap-1.5">
              <Text
                testID={`office-card-name-${id}`}
                className="shrink font-cairo-bold text-base text-[#111111]"
                numberOfLines={1}
              >
                {name}
              </Text>
              {isVerified && (
                <MaterialIcons
                  name="verified"
                  size={16}
                  color="#0284C7"
                  style={{ flexShrink: 0 }}
                />
              )}
            </View>

            <View className="mt-1 flex-row items-center gap-1">
              <LocationIcon color="#6B6A6A" size={13} />
              <Text
                className="font-cairo-medium text-xs leading-[18px] text-[#6B6A6A]"
                numberOfLines={1}
              >
                {location || 'الكويت'}
              </Text>
            </View>
          </View>
        </View>

        {/* Left in RTL: Favorite Heart Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onToggleFavorite}
          className="h-8 w-8 items-center justify-center"
        >
          <HeartIcon
            size={20}
            color={isFavorite ? '#DC2626' : '#111111'}
            filled={isFavorite}
          />
        </TouchableOpacity>
      </View>

      {/* Row 2: Service / Transaction Tags */}
      <View className="mt-2.5 flex-row flex-wrap items-center gap-1.5">
        {displayTags.map((tag, index) => (
          <View
            key={index}
            className="rounded-lg border border-gray-100/60 bg-[#F1F5F9] px-2.5 py-1"
          >
            <Text className="font-cairo-medium text-xs leading-[16px] text-[#111111]">
              {tag}
            </Text>
          </View>
        ))}
      </View>

      {/* Divider */}
      <View className="my-3 h-[1px] w-full bg-gray-100" />

      {/* Row 3: Stats (Properties Count on Right & Rating on Left in RTL) */}
      <View className="flex-row items-center justify-between">
        {/* Right in RTL: Properties Count */}
        <View className="flex-row items-center gap-1.5">
          <BuildingOutlineIcon color="#6B6A6A" size={16} />
          <Text className="font-cairo-medium leading-[20px] text-xs text-[#6B6A6A]">
            {propertiesCount} عقار
          </Text>
        </View>

        {/* Left in RTL: Rating & Reviews */}
        <View className="flex-row items-center gap-1">
          <Text className="font-cairo leading-[22px] text-xs text-[#8E8E93]">
            {reviewsCount > 0 ? `( +${reviewsCount} تقييم )` : '( لا تقييمات )'}
          </Text>
          <Text className="font-cairo-bold leading-[22px] text-xs text-[#111111]">
            {rating}
          </Text>
          <MaterialIcons name="star" size={14} color="#F59E0B" />
        </View>
      </View>

      {/* Row 4: Actions (Call & Chat Buttons) */}
      <View className="mt-3 flex-row items-center justify-between gap-3">
        {/* Right in RTL: Call Button */}
        <TouchableOpacity
          className="h-11 flex-1 flex-row items-center justify-center rounded-full border border-[#15304D] bg-transparent"
          activeOpacity={0.7}
          onPress={handleCall}
        >
          <CallIcon color="#15304D" size={18} />
        </TouchableOpacity>

        {/* Left in RTL: Chat Button */}
        <TouchableOpacity
          testID={`office-card-chat-${id}`}
          className="h-11 flex-1 flex-row items-center justify-center rounded-full border border-[#B28648] bg-transparent"
          activeOpacity={0.7}
          onPress={handleChat}
        >
          <ChatIcon color="#B28648" size={18} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
