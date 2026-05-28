import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import {
  DimensionValue,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { HeartIcon } from '@/assets/icons/home/cards';

export interface CompanyCardProps {
  id: string;
  name: string;
  category: string; // e.g., 'تشطيب • تصميم داخلي • تنفيذ'
  rating: number;
  projectsCount: string; // e.g., '+65'
  serviceArea: string; // e.g., 'يخدم جميع المناطق'
  logoUrl: any;
  isVerified?: boolean;
  isFavorite?: boolean;
  cardWidth?: DimensionValue;
  onPress?: () => void;
  onFavorite?: () => void;
  onQuoteRequest?: () => void;
}

export default function CompanyCard({
  name,
  category,
  rating,
  projectsCount,
  serviceArea,
  logoUrl,
  isVerified = false,
  isFavorite = false,
  cardWidth = '100%',
  onPress,
  onFavorite,
  onQuoteRequest,
}: CompanyCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="mb-4 w-full rounded-sm border border-gray-100 bg-white p-4"
      style={{
        width: cardWidth,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
    >
      {/* --- 1. Top Section: Header --- */}
      <View className="mb-4 flex-row items-start justify-between">
        {/* Top Right: Logo & Info */}
        <View className="mr-3 flex-1 flex-row">
          {/* Logo Box */}
          <View className="h-16 w-16 overflow-hidden rounded-sm">
            <Image
              source={typeof logoUrl === 'string' ? { uri: logoUrl } : logoUrl}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
          <View className="ml-3 mr-1 flex-1">
            <Text
              className="flex-1 font-cairo-semibold text-base leading-[28px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              {name}{' '}
              {isVerified && (
                <MaterialIcons name="verified" size={16} color="#22C55E" />
              )}
            </Text>
            <Text
              className="w-full font-cairo-semibold text-[11px] text-[#6B6A6A]"
              style={{
                writingDirection: 'rtl',
              }}
            >
              {category}
            </Text>
          </View>
        </View>

        {/* Top Left: Rating */}
        <View className="mt-1 flex-row items-center gap-1">
          <FontAwesome5 name="star" size={12} color="#F59E0B" solid />
          <Text className="text-sm font-normal text-[#111111]">{rating}</Text>
        </View>
      </View>

      {/* --- 2. Middle Section: Stats & Heart --- */}
      <View className="mb-4 flex-row items-center justify-between px-1">
        <View className="w-full flex-row gap-4 pr-2">
          <View className="items-start">
            <Text className="font-cairo-bold text-xs text-[#111111]">
              {serviceArea}
            </Text>
            <Text className="font-cairo-medium text-[10px] text-[#6B6A6A]">
              النطاق
            </Text>
          </View>

          {/* Vertical Divider */}
          <View className="flex-1 items-center justify-center">
            <View className="mx-2 h-8 w-[1px] max-w-[1px] bg-[#6B6A6A]" />
          </View>

          <View className="items-end">
            <View className="items-start">
              <Text className="font-cairo-bold text-xs text-[#111111]">
                {projectsCount}
              </Text>
              <Text className="font-cairo-medium text-[10px] text-[#6B6A6A]">
                مشاريع مكتملة
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* --- 3. Bottom Section: Action Button --- */}
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onQuoteRequest}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-[24px] bg-[#15304D] py-2.5"
        >
          <Text className="font-cairo-bold text-sm leading-[22px] text-white">
            طلب عرض سعر
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onFavorite}
          className="h-10 w-10 items-center justify-center p-1"
        >
          <HeartIcon
            size={22}
            color={isFavorite ? '#BA0003' : '#94A3B8'}
            filled={isFavorite}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
