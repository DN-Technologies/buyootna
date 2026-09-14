import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DeviceCard, {
  DeviceItem,
} from '@/features/individual/components/more/DeviceCard';
import LogoutConfirmationModal from '@/features/individual/components/more/LogoutConfirmationModal';
import { devicesService } from '@/shared/api/devices.service';
import ListRowSkeleton from '@/shared/components/skeletons/ListRowSkeleton';
import { useAuthStore } from '@/shared/store/useAuthStore';

export default function RegisteredDevicesScreen() {
  const router = useRouter();
  const currentSessionId = useAuthStore((s) => s.sessionId);

  // Modal Visibility States
  const [selectedDevice, setSelectedDevice] = useState<DeviceItem | null>(null);
  const [showLogoutAll, setShowLogoutAll] = useState(false);

  const { data: devices = [], isLoading, refetch } = useQuery({
    queryKey: ['devices', currentSessionId],
    queryFn: async () => {
      const response = await devicesService.getDevices();
      return response.map((session) => ({
        id: session.id,
        name: session.deviceName,
        platform: session.platform,
        isActive: session.isActive,
        isCurrent: session.id === currentSessionId,
        status: session.isActive ? 'نشط الان' : 'نشط مؤخراً',
        location: session.location || 'الكويت',
      }));
    },
  });

  // Refetch on every focus -- other devices logging in/out after this
  // screen was first loaded (or cached within the app-wide 30s staleTime)
  // wouldn't otherwise show up here until some unrelated remount happened.
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleLogoutDevice = async (id: string) => {
    try {
      await devicesService.revokeDevice(id);
      setSelectedDevice(null);
      refetch();
    } catch (e) {
      console.error('Failed to logout device:', e);
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      await devicesService.revokeAllDevices();
      setShowLogoutAll(false);
      refetch();
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
            <View>
              {[1, 2, 3].map((key) => (
                <ListRowSkeleton key={key} showTrailing />
              ))}
            </View>
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
