import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { devicesService } from '@/shared/api/devices.service';
import DeviceCard from '@/features/individual/components/more/DeviceCard';
import LogoutConfirmationModal from '@/features/individual/components/more/LogoutConfirmationModal';

interface DeviceItem {
  id: string;
  name: string;
  isActive: boolean;
  status: string;
  location: string;
}

export default function RegisteredDevicesScreen() {
  const router = useRouter();

  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal Visibility States
  const [selectedDevice, setSelectedDevice] = useState<DeviceItem | null>(null);
  const [showLogoutAll, setShowLogoutAll] = useState(false);

  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      const response = await devicesService.getDevices();
      const mapped = response.map((session) => ({
        id: session.id,
        name: session.deviceName,
        isActive: session.isActive,
        status: session.isActive ? 'نشط الان' : 'نشط مؤخراً',
        location: session.location || 'الكويت',
      }));
      setDevices(mapped);
    } catch (e) {
      console.error('Failed to load registered devices:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleLogoutDevice = async (id: string) => {
    try {
      await devicesService.revokeDevice(id);
      setDevices(devices.filter((device) => device.id !== id));
      setSelectedDevice(null);
    } catch (e) {
      console.error('Failed to logout device:', e);
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      await devicesService.revokeAllDevices();
      setDevices(devices.filter((device) => device.isActive));
      setShowLogoutAll(false);
    } catch (e) {
      console.error('Failed to logout all devices:', e);
    }
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
          {isLoading ? (
            <ActivityIndicator size="large" color="#15304D" className="py-20" />
          ) : (
            <View>
              {devices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onLogoutPress={() => setSelectedDevice(device)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* --- Confirmation Bottom Sheet for single device --- */}
      <LogoutConfirmationModal
        visible={!!selectedDevice}
        title="تسجيل الخروج ؟"
        description={`هل تريد تسجيل الخروج من جهاز “ ${selectedDevice?.name} ” ؟ سيتعين عليك إدخال كلمة المرور مجدداً للوصول إلى حسابك من هذا الجهاز.`}
        onConfirm={() =>
          selectedDevice && handleLogoutDevice(selectedDevice.id)
        }
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
