import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { CompanyIcon } from '@/assets/icons/home/property';

interface ChatPinnedContextProps {
  title: string;
  badgeText: string;
  price: string;
  area?: string;
  onDismiss: () => void;
}

export default function ChatPinnedContext({
  title,
  badgeText,
  price,
  area,
  onDismiss,
}: ChatPinnedContextProps) {
  return (
    <View className="z-0 flex-row items-center justify-between border-b border-[#ECECEC] bg-[#F9FAFE] px-5 py-3">
      {/* Right Side: Text info and circular building icon */}
      <View className="flex-row items-center gap-3">
        {/* Circular Building Icon Badge */}
        <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F0F4F8]">
          <CompanyIcon size={20} color="#15304D" />
        </View>
        {/* Title & Details Block */}
        <View className="">
          {/* Title & Badge Row */}
          <View className="flex-row items-center gap-2">
            <Text className="font-cairo-semibold text-[14px] text-[#111111]">
              {title}
            </Text>
            <View className="rounded-full bg-[#F5F7F9] px-4 py-0.5">
              <Text className="font-cairo-semibold text-sm text-[#15304D]">
                {badgeText}
              </Text>
            </View>
          </View>

          {/* Price & Area Details */}
          <Text
            className="mt-0.5 font-cairo-medium text-[11px] text-[#7E8A97]"
            style={{ writingDirection: 'rtl' }}
          >
            {price}{area ? ` • ${area}` : ''}
          </Text>
        </View>
      </View>

      {/* Left Side: Back / Dismiss Button */}
      <TouchableOpacity className="p-1" onPress={onDismiss}>
        <Feather name="chevron-left" size={20} color="#7E8A97" />
      </TouchableOpacity>
    </View>
  );
}
