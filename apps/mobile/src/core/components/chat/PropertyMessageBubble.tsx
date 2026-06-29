import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { BathIcon, BedIcon, LocationIcon } from '@/assets/icons/home/property';

interface PropertyContextProps {
  property: {
    id: string;
    imageUrl: string;
    price: number;
    title: string;
    type?: string;
    area?: number;
    bedrooms?: number;
    bathrooms?: number;
    specs?: string; // fallback
    location: string;
  };
  isMine: boolean;
  timestamp: string;
  isRead?: boolean;
  onPressProperty?: () => void;
}

export default function PropertyMessageBubble({
  property,
  isMine,
  timestamp,
  isRead,
  onPressProperty,
}: PropertyContextProps) {
  // Parsing helper if only `specs` string is provided (fallback)
  const renderSpecs = () => {
    const hasStructuredSpecs =
      property.type !== undefined ||
      property.area !== undefined ||
      property.bedrooms !== undefined ||
      property.bathrooms !== undefined;

    if (hasStructuredSpecs) {
      return (
        <View className="flex-row items-center gap-2.5">
          {/* Type and Area */}
          {(property.type || property.area) && (
            <Text className="font-cairo-medium text-[13px] text-[#15304D]">
              {property.type}
              {property.type && property.area ? ' • ' : ''}
              {property.area ? `${property.area} م` : ''}
            </Text>
          )}

          {/* Divider */}
          {property.bathrooms !== undefined &&
            property.bedrooms !== undefined && (
              <Text className="font-cairo-medium text-xs text-[#E2E8F0]">
                |
              </Text>
            )}

          {/* Bedrooms */}
          {property.bedrooms !== undefined && (
            <View className="flex-row items-center gap-1">
              <BedIcon size={16} color="#15304D" />
              <Text className="font-cairo-semibold text-[13px] text-[#15304D]">
                {property.bedrooms}
              </Text>
            </View>
          )}

          {/* Divider */}
          {property.bedrooms !== undefined &&
            (property.type || property.area) && (
              <Text className="font-cairo-medium text-xs text-[#E2E8F0]">
                |
              </Text>
            )}

          {/* Bathrooms */}
          {property.bathrooms !== undefined && (
            <View className="flex-row items-center gap-1">
              <BathIcon size={16} color="#15304D" />
              <Text className="font-cairo-semibold text-[13px] text-[#15304D]">
                {property.bathrooms}
              </Text>
            </View>
          )}
        </View>
      );
    }

    // Fallback to legacy specs string representation
    return (
      <Text className="font-cairo-medium text-[13px] text-[#15304D]">
        {property.specs}
      </Text>
    );
  };

  return (
    <View
      className={`mb-4 w-full flex-row ${isMine ? 'justify-start' : 'justify-end'}`}
    >
      <View
        className={`w-80 max-w-[90%] ${isMine ? 'items-start' : 'items-end'}`}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPressProperty}
          className="w-full overflow-hidden rounded-md border border-[#ECECEC] bg-white shadow-sm shadow-gray-200/50"
        >
          {/* Top Image - Redesigned to be taller and full bleed */}
          <Image
            source={{ uri: property.imageUrl }}
            className="h-48 w-full bg-gray-100"
            resizeMode="cover"
          />

          {/* Bottom Content - Right-aligned styling to match target design */}
          <View className="p-4">
            {/* Price section - unified styling */}
            <View className="mb-2 flex-row items-baseline gap-1.5">
              <Text className="font-cairo-bold text-2xl text-[#15304D]">
                {property.price.toLocaleString()}
              </Text>
              <Text className="font-cairo-bold text-sm text-[#15304D]">
                د.ك
              </Text>
            </View>

            {/* Specs row with icons */}
            <View className="mb-3">{renderSpecs()}</View>

            {/* Location row */}
            <View className="flex-row items-center gap-1.5">
              <LocationIcon size={12} color="#7E8A97" />
              <Text
                className="text-right font-cairo-medium text-[11px] text-[#7E8A97]"
                numberOfLines={1}
              >
                {property.location}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Meta row (Timestamp & Read Receipt) */}
        <View className="mt-1.5 flex-row items-center gap-1">
          {isMine && (
            <Feather
              name="check"
              size={12}
              color={isRead ? '#15304D' : '#94A3B8'}
            />
          )}
          <Text className="font-cairo-medium text-[10px] text-[#94A3B8]">
            {timestamp}
          </Text>
        </View>
      </View>
    </View>
  );
}
