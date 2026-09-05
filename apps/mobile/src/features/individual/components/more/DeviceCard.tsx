import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { DeviceIcon } from '@/assets/icons/settings';

export interface DeviceItem {
  id: string;
  name: string;
  platform: 'ios' | 'android' | null;
  isActive: boolean;
  isCurrent: boolean;
  status: string;
  location: string;
}

interface DeviceCardProps {
  device: DeviceItem;
  onLogoutPress: () => void;
}

export default function DeviceCard({ device, onLogoutPress }: DeviceCardProps) {
  return (
    <View className="mb-4 flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4">
      {/* Right Side: Badge & Info */}
      <View className="flex-row items-center gap-3">
        {/* Circular Phone Icon Badge */}
        <View className="h-[44px] w-[44px] items-center justify-center rounded-full bg-[#F0F4F8]">
          {device.platform === 'ios' ? (
            <Ionicons name="logo-apple" size={20} color="#15304D" />
          ) : device.platform === 'android' ? (
            <Ionicons name="logo-android" size={20} color="#15304D" />
          ) : (
            <DeviceIcon size={20} color="#15304D" />
          )}
        </View>

        {/* Info Details */}
        <View className="items-start">
          <Text className="font-cairo-semibold text-[14px] text-[#111111]">
            {device.name}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-1">
            {device.isActive && (
              <View className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
            )}
            <Text
              className={`font-cairo-medium text-[11px] leading-[18px] ${
                device.isActive ? 'text-[#22C55E]' : 'text-[#7E8A97]'
              }`}
            >
              {device.status} • {device.location}
            </Text>
          </View>
        </View>
      </View>

      {/* Left Side: Log Out Button (hidden for the device you're using right now) */}
      {!device.isCurrent && (
        <TouchableOpacity onPress={onLogoutPress}>
          <Text className="font-cairo-medium text-[12px] leading-[20px] text-[#9C1E28]">
            تسجيل الخروج
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
