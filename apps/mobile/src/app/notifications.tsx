import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  const router = useRouter();

  // Notification Toggle States
  const [appNotifications, setAppNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [phoneNotifications, setPhoneNotifications] = useState(false);

  const isAnyActive =
    appNotifications || emailNotifications || phoneNotifications;

  const handleMasterToggle = () => {
    if (isAnyActive) {
      // Turn all off
      setAppNotifications(false);
      setEmailNotifications(false);
      setPhoneNotifications(false);
    } else {
      // Turn all on
      setAppNotifications(true);
      setEmailNotifications(true);
      setPhoneNotifications(true);
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
              title="إشارات التطبيق"
              value={appNotifications}
              onValueChange={setAppNotifications}
            />
            <NotificationSwitchRow
              title="إشعارات البريد الإلكتروني"
              value={emailNotifications}
              onValueChange={setEmailNotifications}
            />
            <NotificationSwitchRow
              title="إشعارات الهاتف"
              value={phoneNotifications}
              onValueChange={setPhoneNotifications}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
