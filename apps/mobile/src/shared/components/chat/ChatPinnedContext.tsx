import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { CompanyIcon } from '@/assets/icons/home/property';

interface ChatPinnedContextProps {
  title: string;
  badgeText: string;
  price: string;
  area?: string;
  imageUrl?: string;
  onDismiss: () => void;
  onPress?: () => void;
}

export default function ChatPinnedContext({
  title,
  badgeText,
  price,
  area,
  imageUrl,
  onDismiss,
  onPress,
}: ChatPinnedContextProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="z-0 flex-row items-center justify-between border-b border-[#ECECEC] bg-[#F9FAFE] px-4 py-2.5"
    >
      {/* Right Side: Image/Icon and Text info */}
      <View className="flex-1 flex-row items-center gap-3 pr-2">
        {imageUrl && !imageUrl.includes('no-image') ? (
          <Image
            source={
              !imageUrl.includes('placeholder')
                ? { uri: imageUrl }
                : require('@/assets/images/no-image.png')
            }
            className="h-11 w-11 rounded-lg bg-gray-100"
            contentFit="cover"
          />
        ) : (
          <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F0F4F8]">
            <CompanyIcon size={20} color="#15304D" />
          </View>
        )}

        {/* Title & Details Block */}
        <View className="flex-1 justify-center">
          {/* Title & Badge Row */}
          <View className="flex-row items-center gap-2">
            <Text
              className="flex-shrink font-cairo-semibold text-[13px] text-[#111111]"
              numberOfLines={1}
            >
              {title}
            </Text>
            {badgeText ? (
              <View className="rounded-full bg-[#EBF3FA] px-2.5 py-0.5">
                <Text className="font-cairo-bold text-[11px] text-[#15304D]">
                  {badgeText}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Price & Area Details */}
          <Text
            className="mt-0.5 font-cairo-medium text-[11px] text-[#7E8A97]"
            style={{ writingDirection: 'rtl' }}
            numberOfLines={1}
          >
            {price}
            {area ? ` • ${area}` : ''}
          </Text>
        </View>
      </View>

      {/* Left Side: Chevron Button */}
      <TouchableOpacity className="p-1" onPress={onPress || onDismiss}>
        <Feather name="chevron-left" size={20} color="#7E8A97" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
