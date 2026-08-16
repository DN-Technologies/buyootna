import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { notificationsService } from '@/shared/api/notifications.service';
import GuestEmptyState from '@/shared/components/GuestEmptyState';
import ListRowSkeleton from '@/shared/components/skeletons/ListRowSkeleton';
import { useAuthStore } from '@/shared/store/useAuthStore';

export default function NotificationsScreen() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  // Notification Toggle States
  const [appNotifications, setAppNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [phoneNotifications, setPhoneNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      loadPreferences();
    }
  }, [token]);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const prefs = await notificationsService.getPreferences();
      setAppNotifications(prefs.appEnabled);
      setEmailNotifications(prefs.emailEnabled);
      setPhoneNotifications(prefs.phoneEnabled);
    } catch (e) {
      console.error('Failed to load notification preferences:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const isAnyActive =
    appNotifications || emailNotifications || phoneNotifications;

  const handleMasterToggle = async () => {
    const targetState = !isAnyActive;
    setAppNotifications(targetState);
    setEmailNotifications(targetState);
    setPhoneNotifications(targetState);
    try {
      await notificationsService.updatePreferences({
        appEnabled: targetState,
        emailEnabled: targetState,
        phoneEnabled: targetState,
      });
    } catch (e) {
      console.error('Failed to update master notification preferences:', e);
    }
  };

  const handleToggleApp = async (val: boolean) => {
    setAppNotifications(val);
    try {
      await notificationsService.updatePreferences({ appEnabled: val });
    } catch (e) {
      console.error('Failed to update app notifications:', e);
    }
  };

  const handleToggleEmail = async (val: boolean) => {
    setEmailNotifications(val);
    try {
      await notificationsService.updatePreferences({ emailEnabled: val });
    } catch (e) {
      console.error('Failed to update email notifications:', e);
    }
  };

  const handleTogglePhone = async (val: boolean) => {
    setPhoneNotifications(val);
    try {
      await notificationsService.updatePreferences({ phoneEnabled: val });
    } catch (e) {
      console.error('Failed to update phone notifications:', e);
    }
  };

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
