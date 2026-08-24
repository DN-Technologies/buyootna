import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Linking, Text, TouchableOpacity, View } from 'react-native';

import {
  CallIcon,
  ChatIcon,
  HeartIcon,
  LocationIcon,
  WhatsappIcon,
} from '@/assets/icons/home/cards';
import { showAlert } from '@/shared/utils/alert';

export interface OfficeListCardProps {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  location: string;
  logoUrl?: string;
  isVerified?: boolean;
  isFavorite?: boolean;
  phone?: string | null;
  whatsapp?: string | null;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  onChatPress?: () => void;
}

export default function OfficeListCard({
  id,
  name,
  rating,
  location,
  logoUrl,
  isFavorite = false,
  phone,
  whatsapp,
  onPress,
  onToggleFavorite,
  onChatPress,
}: OfficeListCardProps) {
  const router = useRouter();

  const handleWhatsApp = () => {
    const targetPhone = whatsapp || phone;
    if (!targetPhone) {
      showAlert('تنبيه', 'لا يوجد رقم واتساب متاح لهذا المكتب');
      return;
    }
    const cleanPhone = targetPhone.replace(/[^0-9+]/g, '');
    const waUrl = `whatsapp://send?phone=${cleanPhone}`;
    const webUrl = `https://wa.me/${cleanPhone}`;
    Linking.canOpenURL(waUrl)
      .then((supported) => {
        Linking.openURL(supported ? waUrl : webUrl);
      })
      .catch(() => {
        Linking.openURL(webUrl);
      });
  };

  const handleCall = () => {
    if (!phone) {
      showAlert('تنبيه', 'لا يوجد رقم هاتف متاح لهذا المكتب');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      showAlert('خطأ', 'تعذر إجراء المكالمة الهاتفية');
    });
  };

  const handleChat = () => {
    if (onChatPress) {
      onChatPress();
      return;
    }
    router.push(`/office/${id}` as any);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="mb-4 w-full flex-row overflow-hidden rounded-lg border border-[#ECECEC] bg-white"
      style={{
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
    >
      {/* --- Logo Panel (full-bleed, right edge) --- */}
      <View className="w-[130px] items-center justify-center bg-[#15304D]">
        {logoUrl ? (
          <Image
            source={{ uri: logoUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <MaterialCommunityIcons name="home-city-outline" size={56} color="#B28648" />
        )}
      </View>
      {/* --- Content Column --- */}
      <View className="flex-1 p-4">
        {/* Header: Name & Heart */}
        <View className="mb-2 flex-row items-start justify-between">
          <Text
            className="flex-1 font-cairo-semibold text-base text-[#111111]"
            style={{ writingDirection: 'rtl' }}
            numberOfLines={1}
          >
            {name}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onToggleFavorite}
            className="-mt-1 h-8 w-8 items-center justify-center"
          >
            <HeartIcon
              size={20}
              color={isFavorite ? '#BA0003' : '#111111'}
              filled={isFavorite}
            />
          </TouchableOpacity>
        </View>

        {/* Stats: Location & Rating */}
        <View className="mb-3 flex-row items-center justify-between">
          {!!location && (
            <View className="flex-shrink flex-row items-center gap-1">
              <LocationIcon color="#6B6A6A" size={13} />
              <Text
                className="font-cairo-medium text-[12px] text-[#6B6A6A]"
                numberOfLines={1}
              >
                {location}
              </Text>
            </View>
          )}

          <View className="flex-row items-center gap-1">
            <MaterialIcons name="star" size={14} color="#F59E0B" />
            <Text className="font-cairo-medium text-[12px] text-[#111111]">
              {rating}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            className="h-10 flex-1 flex-row items-center justify-center rounded-[24px] border border-[#15304D]"
            activeOpacity={0.7}
            onPress={handleCall}
          >
            <CallIcon color="#15304D" size={16} />
          </TouchableOpacity>

          <TouchableOpacity
            className="h-10 flex-1 flex-row items-center justify-center rounded-[24px] border border-[#60D669]"
            activeOpacity={0.7}
            onPress={handleWhatsApp}
          >
            <WhatsappIcon size={18} />
          </TouchableOpacity>

          <TouchableOpacity
            className="h-10 flex-1 flex-row items-center justify-center rounded-[24px] border border-[#B28648]"
            activeOpacity={0.7}
            onPress={handleChat}
          >
            <ChatIcon color="#B28648" size={16} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
