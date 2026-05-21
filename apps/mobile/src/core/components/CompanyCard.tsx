import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

export interface CompanyCardProps {
  id: string;
  name: string;
  category: string; // e.g., 'تشطيب • تصميم داخلي • تنفيذ'
  rating: number;
  projectsCount: string; // e.g., '+65'
  serviceArea: string; // e.g., 'يخدم جميع المناطق'
  logoUrl: string;
  isVerified?: boolean;
  isFavorite?: boolean;
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
  onPress,
  onFavorite,
  onQuoteRequest,
}: CompanyCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="mb-4 w-full rounded-[24px] border border-gray-100 bg-white p-4"
      style={{
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
    >
      {/* --- 1. Top Section: Header --- */}
      <View className="mb-4 flex-row items-start justify-between">
        {/* Top Left: Rating */}
        <View className="mt-1 flex-row items-center gap-1">
          <FontAwesome5 name="star" size={12} color="#F59E0B" solid />
          <Text className="font-cairo-bold text-sm text-[#111111]">
            {rating}
          </Text>
        </View>

        {/* Top Right: Logo & Info */}
        <View className="flex-1 flex-row items-center justify-end pl-4">
          <View className="mr-3 items-end">
            <View className="mb-1 flex-row items-center gap-1">
              {isVerified && (
                <MaterialIcons name="verified" size={16} color="#22C55E" />
              )}
              <Text className="font-cairo-bold text-base text-[#111111]">
                {name}
              </Text>
            </View>
            <Text className="text-right font-cairo-semibold text-xs text-[#6B6A6A]">
              {category}
            </Text>
          </View>

          {/* Logo Box */}
          <View className="h-12 w-12 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
            <Image
              source={{ uri: logoUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* --- 2. Middle Section: Stats & Heart --- */}
      <View className="mb-4 flex-row items-center justify-between px-1">
        {/* Left: Heart Icon */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onFavorite}
          className="p-1"
        >
          <FontAwesome5
            name="heart"
            size={20}
            color={isFavorite ? '#EF4444' : '#94A3B8'}
            solid={isFavorite}
          />
        </TouchableOpacity>

        {/* Right: Stats Row */}
        <View className="flex-1 flex-row items-center justify-end gap-4 pr-2">
          <View className="items-center">
            <Text className="mb-0.5 font-cairo-bold text-xs text-[#111111]">
              {projectsCount}
            </Text>
            <Text className="font-cairo-semibold text-[10px] text-[#94A3B8]">
              مشاريع مكتملة
            </Text>
          </View>

          {/* Vertical Divider */}
          <View className="mx-2 h-8 w-[1px] bg-gray-200" />

          <View className="items-center">
            <Text className="mb-0.5 font-cairo-bold text-xs text-[#111111]">
              {serviceArea}
            </Text>
            <Text className="font-cairo-semibold text-[10px] text-[#94A3B8]">
              النطاق
            </Text>
          </View>
        </View>
      </View>

      {/* --- 3. Bottom Section: Action Button --- */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onQuoteRequest}
        className="w-full flex-row items-center justify-center space-x-2 space-x-reverse rounded-xl bg-[#15304D] py-3.5"
      >
        <Text className="font-cairo-bold text-sm text-white">طلب عرض سعر</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
