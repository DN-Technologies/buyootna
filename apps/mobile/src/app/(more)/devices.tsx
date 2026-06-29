import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeviceIcon } from '@/assets/icons/settings';

interface DeviceItem {
  id: string;
  name: string;
  isActive: boolean;
  status: string;
  location: string;
}

export default function RegisteredDevicesScreen() {
  const router = useRouter();

  // Mock devices list matching the design
  const [devices, setDevices] = useState<DeviceItem[]>([
    {
      id: '1',
      name: 'iPhone 15 Pro',
      isActive: true,
      status: 'نشط الان',
      location: 'السالمية، الكويت',
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24',
      isActive: false,
      status: 'نشط منذ ساعتين',
      location: 'السالمية، الكويت',
    },
    {
      id: '3',
      name: 'iPhone 15 Pro',
      isActive: false,
      status: 'آخر نشاط: أمس 8:30 م',
      location: 'السالمية، الكويت',
    },
  ]);

  const handleLogoutDevice = (id: string) => {
    setDevices(devices.filter((device) => device.id !== id));
  };

  const handleLogoutAllDevices = () => {
    // Keep only the active device
    setDevices(devices.filter((device) => device.isActive));
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* --- 1. Header --- */}
      <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-4">
        <TouchableOpacity onPress={() => router.back()} className="w-8">
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
          الاجهزة المسجلة
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}
      >
        <View className="px-5">
          {/* --- Master Log Out Button --- */}
          <TouchableOpacity
            onPress={handleLogoutAllDevices}
            className="mb-8 flex-row items-center justify-center gap-2 rounded-full border border-[#9C1E28] bg-white py-3.5"
          >
            <Text className="font-cairo-bold text-[14px] leading-[22px] text-[#9C1E28]">
              تسجيل الخروج من جميع الاجهزة
            </Text>
          </TouchableOpacity>

          {/* --- Devices List --- */}
          <View>
            {devices.map((device) => (
              <View
                key={device.id}
                className="mb-4 flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4"
              >
                {/* Right Side: Badge & Info */}
                <View className="flex-row items-center gap-3">
                  {/* Circular Phone Icon Badge */}
                  <View className="h-[44px] w-[44px] items-center justify-center rounded-full bg-[#F0F4F8]">
                    <DeviceIcon size={20} color="#15304D" />
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

                {/* Left Side: Log Out Button */}
                <TouchableOpacity onPress={() => handleLogoutDevice(device.id)}>
                  <Text className="font-cairo-medium text-[12px] leading-[20px] text-[#9C1E28]">
                    تسجيل الخروج
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
