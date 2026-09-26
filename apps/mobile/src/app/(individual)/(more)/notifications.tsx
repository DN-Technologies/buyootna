import { Feather } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  NotificationPrefsResponse,
  notificationsService,
} from '@/shared/api/notifications.service';
import GuestEmptyState from '@/shared/components/auth/GuestEmptyState';
import ListRowSkeleton from '@/shared/components/skeletons/ListRowSkeleton';
import { useAuthStore } from '@/shared/store/useAuthStore';

const PREFS_QUERY_KEY = ['notificationPreferences'];

export default function NotificationsScreen() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const { data: prefs, isLoading } = useQuery({
    queryKey: PREFS_QUERY_KEY,
    queryFn: () => notificationsService.getPreferences(),
    enabled: !!token,
  });

  const appNotifications = prefs?.appEnabled ?? true;
  const emailNotifications = prefs?.emailEnabled ?? false;
  const phoneNotifications = prefs?.phoneEnabled ?? false;
  const isAnyActive =
    appNotifications || emailNotifications || phoneNotifications;

  const updatePrefs = async (
    patch: Partial<Omit<NotificationPrefsResponse, 'id' | 'userId'>>,
  ) => {
    queryClient.setQueryData<NotificationPrefsResponse>(
      PREFS_QUERY_KEY,
      (prev) => (prev ? { ...prev, ...patch } : prev),
    );
    try {
      await notificationsService.updatePreferences(patch);
    } catch (e) {
      console.error('Failed to update notification preferences:', e);
    }
  };

  const handleMasterToggle = () => {
    const targetState = !isAnyActive;
    updatePrefs({
      appEnabled: targetState,
      emailEnabled: targetState,
      phoneEnabled: targetState,
    });
  };

  const handleToggleApp = (val: boolean) => updatePrefs({ appEnabled: val });
  const handleToggleEmail = (val: boolean) =>
    updatePrefs({ emailEnabled: val });
  const handleTogglePhone = (val: boolean) =>
    updatePrefs({ phoneEnabled: val });

  // Helper row component for simple switch items
  const NotificationSwitchRow = ({
    title,
    value,
    onValueChange,
  }: {
    title: string;
    value: boolean;
    onValueChange: (val: boolean) => void;
  }) => (
    <View className="flex-row items-center justify-between border-b border-gray-50 py-4">
      {/* Right Side (Title) */}
      <Text className="font-cairo-medium text-[14px] text-[#111111]">
        {title}
      </Text>

      {/* Left Side (Switch) */}
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E2E8F0', true: '#15304D' }}
        thumbColor="#FFFFFF"
        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
      />
    </View>
  );

  if (!token) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        {/* --- 1. Header --- */}
        <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-4">
          <TouchableOpacity onPress={() => router.back()} className="w-8">
            <Feather name="chevron-right" size={24} color="#111111" />
          </TouchableOpacity>
          <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
            الإشعارات
          </Text>
          <View className="w-8" />
        </View>
        <GuestEmptyState
          icon="bell"
          title="ابق على اطلاع دائم"
          description="سجل حسابك لاستقبال إشعارات العقارات الجديدة والرسائل والتنبيهات المهمة."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* --- 1. Header --- */}
      <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-4">
        <TouchableOpacity onPress={() => router.back()} className="w-8">
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
          الإشعارات
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}
      >
        <View className="px-5">
          {isLoading ? (
            <View>
              <View className="mb-8 h-[48px] w-full rounded-full bg-slate-100" />
              {[1, 2, 3].map((key) => (
                <ListRowSkeleton key={key} showIcon={false} showTrailing />
              ))}
            </View>
          ) : (
            <>
              {/* --- Master Toggle Button --- */}
              <TouchableOpacity
                onPress={handleMasterToggle}
                className={`mb-8 flex-row items-center justify-center gap-2 rounded-full border py-3.5 ${
                  isAnyActive
                    ? 'border-[#9C1E28] bg-white'
                    : 'border-[#15304D] bg-white'
                }`}
              >
                <Feather
                  name={isAnyActive ? 'bell-off' : 'bell'}
                  size={18}
                  color={isAnyActive ? '#9C1E28' : '#15304D'}
                />
                <Text
                  className={`font-cairo-bold text-[14px] leading-[24px] ${
                    isAnyActive ? 'text-[#9C1E28]' : 'text-[#15304D]'
                  }`}
                >
                  {isAnyActive ? 'ايقاف جميع التنبيهات' : 'تشغيل جميع التنبيهات'}
                </Text>
              </TouchableOpacity>

              {/* --- Switch Lists --- */}
              <View>
                <NotificationSwitchRow
                  title="الإشعارات التطبيق"
                  value={appNotifications}
                  onValueChange={handleToggleApp}
                />
                <NotificationSwitchRow
                  title="إشعارات البريد الإلكتروني"
                  value={emailNotifications}
                  onValueChange={handleToggleEmail}
                />
                <NotificationSwitchRow
                  title="إشعارات الهاتف"
                  value={phoneNotifications}
                  onValueChange={handleTogglePhone}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
