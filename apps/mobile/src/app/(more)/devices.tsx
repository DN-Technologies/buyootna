import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DeviceCard from '@/core/components/more/DeviceCard';
import LogoutConfirmationModal from '@/core/components/more/LogoutConfirmationModal';

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

  // Modal Visibility States
  const [selectedDevice, setSelectedDevice] = useState<DeviceItem | null>(null);
  const [showLogoutAll, setShowLogoutAll] = useState(false);

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
            onPress={() => setShowLogoutAll(true)}
            className="mb-8 flex-row items-center justify-center gap-2 rounded-full border border-[#9C1E28] bg-white py-3.5"
          >
            <Text className="font-cairo-bold text-[14px] leading-[22px] text-[#9C1E28]">
              تسجيل الخروج من جميع الاجهزة
            </Text>
          </TouchableOpacity>

          {/* --- Devices List --- */}
          <View>
            {devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onLogoutPress={() => setSelectedDevice(device)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* --- Confirmation Bottom Sheet for single device --- */}
      <LogoutConfirmationModal
        visible={!!selectedDevice}
        title="تسجيل الخروج ؟"
        description={`هل تريد تسجيل الخروج من جهاز “ ${selectedDevice?.name} ” ؟ سيتعين عليك إدخال كلمة المرور مجدداً للوصول إلى حسابك من هذا الجهاز.`}
        onConfirm={() => selectedDevice && handleLogoutDevice(selectedDevice.id)}
        onClose={() => setSelectedDevice(null)}
      />

      {/* --- Confirmation Bottom Sheet for all devices --- */}
      <LogoutConfirmationModal
        visible={showLogoutAll}
        title="تسجيل الخروج من جميع الأجهزة ؟"
        description="سيتم إنهاء الجلسة وتسجيل الخروج فوراً من كافة المتصفحات والأجهزة المتصلة بحسابك، باستثناء هذا الجهاز الحالي. هذا الإجراء يحمي حسابك إذا كنت تشك في وجود نشاط غير مصرح به."
        onConfirm={handleLogoutAllDevices}
        onClose={() => setShowLogoutAll(false)}
      />
    </SafeAreaView>
  );
}
