import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export interface ChatItemProps {
  id: string;
  user: {
    name: string;
    avatarUrl: string;
    isOnline: boolean;
  };
  propertyContext?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isRead?: boolean;
  onPress: () => void;
}

export default function ChatListItem({
  user,
  propertyContext,
  lastMessage,
  timestamp,
  unreadCount = 0,
  isRead = false,
  onPress,
}: ChatItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center gap-3 border-b border-gray-50 bg-white px-5 py-4"
    >
      {/* Right: Avatar */}
      <View className="relative">
        <Image
          source={{ uri: user.avatarUrl }}
          className="h-14 w-14 rounded-full bg-gray-100"
        />
        {user.isOnline && (
          <View className="absolute bottom-0 left-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#22C55E]" />
        )}
      </View>

      {/* Middle: Content */}
      <View className="flex-1 items-start justify-center pr-3">
        <Text
          className="mb-0.5 font-cairo-semibold text-[14px] text-[#111111]"
          numberOfLines={1}
        >
          {user.name}
        </Text>

        {propertyContext && (
          <Text
            className="mb-1 font-cairo text-[12px] text-[#15304D]"
            numberOfLines={1}
          >
            ↳ {propertyContext}
          </Text>
        )}

        <Text
          className={`font-cairo-medium text-[13px] ${unreadCount > 0 ? 'text-[#111111]' : 'text-[#ADB5BD]'}`}
          numberOfLines={1}
        >
          {lastMessage}
        </Text>
      </View>

      {/* Left: Timestamp & Badges (Right-to-Left Layout requires flipping logical sides) */}
      <View className="h-12 w-16 items-end justify-between">
        <Text className="font-cairo text-[12px] text-[#A4A4A4]">
          {timestamp}
        </Text>
        {unreadCount > 0 ? (
          <View className="mt-3 h-6 w-6 items-center justify-center rounded-full bg-[#991B1B]">
            <Text className="font-cairo-bold text-[11px] text-white">
              {unreadCount}
            </Text>
          </View>
        ) : (
          <Feather
            name="check-circle" // Represents read/delivered state
            size={14}
            color={isRead ? '#15304D' : '#94A3B8'}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}
