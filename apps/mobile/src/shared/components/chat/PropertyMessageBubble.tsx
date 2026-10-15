import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { BathIcon, BedIcon, LocationIcon } from '@/assets/icons/home/property';
import MessageMeta from '@/shared/components/chat/MessageMeta';
import { MessageStatus } from '@/shared/utils/chatReceipts';
import { formatNumber } from '@/shared/utils/formatNumber';
import { getArabicTypeLabel } from '@/shared/utils/helpers/property';

interface PropertyContextProps {
  property: {
    id: string;
    imageUrl: string;
    price?: number | null;
    title: string;
    type?: string;
    area?: number;
    bedrooms?: number;
    bathrooms?: number;
    specs?: string; // fallback
    location: string;
    // Off the market (expired / closed): not opened
    unavailable?: boolean;
  };
  isMine: boolean;
  timestamp: string;
  // My message: sending / sent / delivered / read ticks
  status?: MessageStatus | null;
  quote?: React.ReactNode;
  onPressProperty?: () => void;
}

export default function PropertyMessageBubble({
  property,
  isMine,
  timestamp,
  status,
  quote,
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
              {getArabicTypeLabel(property.type)}
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
        {/* The message this one replies to */}
        {quote}
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={property.unavailable}
          onPress={onPressProperty}
          className="w-full overflow-hidden rounded-md border border-[#ECECEC] bg-white shadow-sm shadow-gray-200/50"
        >
          {/* Top Image - Redesigned to be taller and full bleed */}
          <Image
            source={
              property.imageUrl &&
              !property.imageUrl.includes('no-image') &&
              !property.imageUrl.includes('placeholder')
                ? { uri: property.imageUrl }
                : require('@/assets/images/no-image.png')
            }
            className="h-48 w-full bg-gray-100"
            contentFit="cover"
          />

          {property.unavailable && (
            <View className="absolute left-0 right-0 top-0 h-48 items-center justify-center bg-black/50">
              <Text className="font-cairo-bold text-[15px] text-white">
                الإعلان غير متاح
              </Text>
            </View>
          )}

          {/* Bottom Content - Right-aligned styling to match target design */}
          <View className="p-4">
            {/* Price section - unified styling */}
            <View className="mb-2 flex-row items-baseline gap-1.5">
              {property.price && property.price > 0 ? (
                <>
                  <Text className="font-cairo-bold text-2xl text-[#15304D]">
                    {formatNumber(property.price)}
                  </Text>
                  <Text className="font-cairo-bold text-sm text-[#15304D]">
                    د.ك
                  </Text>
                </>
              ) : (
                <Text className="font-cairo-bold text-lg text-[#15304D]">
                  {property.type === 'EXCHANGE' || property.type === 'للبدل' ? 'للبدل' : 'السعر غير معلن'}
                </Text>
              )}
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

        <MessageMeta timestamp={timestamp} status={status} />
      </View>
    </View>
  );
}
