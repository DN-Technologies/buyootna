import { MaterialIcons } from '@expo/vector-icons';
import {
  DimensionValue,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { HeartIcon } from '@/assets/icons/home/cards';
import Avatar from '@/shared/components/ui/Avatar';

export interface SuggestionCardProps {
  id: string;
  name: string;
  category: string;
  serviceArea: string;
  projectsCount: string;
  logoUrl: any;
  isVerified?: boolean;
  isFavorite?: boolean;
  cardWidth?: DimensionValue;
  onPress: () => void;
  onFavoritePress?: () => void;
}

export default function SuggestionCard({
  name,
  category,
  serviceArea,
  projectsCount,
  logoUrl,
  isVerified = false,
  isFavorite = false,
  cardWidth = '100%',
  onPress,
  onFavoritePress,
}: SuggestionCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="mb-4 w-full flex-row items-center border border-gray-100"
      style={{
        width: cardWidth,
        borderRadius: 4,
        padding: 12,
        gap: 10,
        backgroundColor: '#FEFEFE',
        elevation: 2,
        shadowColor: '#919191',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
      }}
    >
      {/* 1. Image Box  */}
      <View className="h-[88px] w-[64px] overflow-hidden rounded-sm bg-[#F1F5F9]">
        {logoUrl && typeof logoUrl !== 'string' ? (
          // A bundled image (require)
          <Image
            source={logoUrl}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          // A URL, or the person icon when there's none
          <Avatar uri={logoUrl} testID="suggestion-card-image" />
        )}
      </View>

      {/* 2. Content Column  */}
      <View className="flex-1 justify-between">
        {/* Top Row: Title & Category (right) and Heart Icon (left) */}
        <View className="mb-3 flex-row items-start justify-between">
          {/* Title & Category  */}
          <View className="flex-1 items-end pr-1">
            <Text
              className="w-full font-cairo-semibold text-base leading-[28px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
              numberOfLines={1}
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
              numberOfLines={1}
            >
              {category}
            </Text>
          </View>

          {/* Heart Icon  */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onFavoritePress}
            className="h-10 w-10 items-center justify-center p-1"
          >
            <HeartIcon
              size={22}
              color={isFavorite ? '#BA0003' : '#111111'}
              filled={isFavorite}
            />
          </TouchableOpacity>
        </View>

        {/* Bottom Row: Stats  */}
        <View className="flex-row items-center justify-between px-1">
          <View className="w-full flex-row items-center">
            {/* Service Area  */}
            <View className="flex-[2] items-start">
              <Text
                className="font-cairo-bold text-xs text-[#111111]"
                numberOfLines={1}
              >
                {serviceArea}
              </Text>
              <Text className="font-cairo-medium text-[10px] text-[#6B6A6A]">
                النطاق
              </Text>
            </View>

            {/* Vertical Divider */}
            <View className="mx-4 h-8 w-[1px] bg-[#E2E8F0]" />

            {/* Projects Count  */}
            <View className="min-w-[80px] items-end">
              <View className="items-start">
                <Text
                  className="font-cairo-bold text-xs text-[#111111]"
                  numberOfLines={1}
                >
                  {projectsCount}
                </Text>
                <Text className="font-cairo-medium text-[10px] text-[#6B6A6A]">
                  مشاريع مكتملة
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
