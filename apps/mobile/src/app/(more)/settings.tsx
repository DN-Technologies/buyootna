import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CallIcon,
  DeviceIcon,
  HideAdIcon,
  HideIcon,
  InfoIcon,
  LockIcon,
  NotificationIcon,
  PrivacyIcon,
  ShowIcon,
  TermsIcon,
} from '@/assets/icons/settings';
import MenuItem from '@/core/components/more/MenuItem';

export default function SettingsScreen() {
  const router = useRouter();

  // Privacy Toggle States
  const [showPhone, setShowPhone] = useState(true);
  const [showWhatsapp, setShowWhatsapp] = useState(true);
  const [hideActivity, setHideActivity] = useState(false);
  const [hideOfficeAds, setHideOfficeAds] = useState(false);

  // Helper component for Switch rows
  const SettingsSwitchItem = ({
    icon: Icon,
    title,
    value,
    onValueChange,
  }: {
    icon: React.ComponentType<{ color?: string; size?: number }>;
    title: string;
    value: boolean;
    onValueChange: (val: boolean) => void;
  }) => (
    <View className="flex-row items-center justify-between bg-[#F9FAFE] py-4">
      {/* Right Side (Icon & Title) */}
      <View className="flex-row items-center gap-2">
        <Icon color="#111111" size={22} />
        <Text className="font-cairo-medium text-[14px] text-[#111111]">
          {title}
        </Text>
      </View>

      {/* Left Side (Switch Toggle) */}
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
          الإعدادات
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 20 }}
      >
        <View className="gap-6 px-5">
          {/* --- Section: Notifications --- */}
          <View>
            <Text
              className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              الاشعارات
            </Text>
            <View className="rounded-xl bg-[#F9FAFE] px-4">
              <MenuItem
                icon={NotificationIcon}
                title="الإشعارات"
                onPress={() => router.push('/notifications')}
              />
            </View>
          </View>

          {/* --- Section: Account & Security --- */}
          <View>
            <Text
              className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              الحساب والامان
            </Text>
            <View className="rounded-xl bg-[#F9FAFE] px-4">
              <MenuItem
                icon={LockIcon}
                title="تغيير كلمة المرور"
                onPress={() => console.log('Navigate to Change Password')}
              />
              <MenuItem
                icon={DeviceIcon}
                title="الاجهزة المسجلة"
                onPress={() => router.push('/devices')}
              />
            </View>
          </View>

          {/* --- Section: Privacy --- */}
          <View>
            <Text
              className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              الخصوصية
            </Text>
            <View className="rounded-xl bg-[#F9FAFE] px-4">
              <SettingsSwitchItem
                icon={InfoIcon}
                title="اظهار رقم الهاتف"
                value={showPhone}
                onValueChange={setShowPhone}
              />
              <SettingsSwitchItem
                icon={ShowIcon}
                title="اظهار رقم الواتساب"
                value={showWhatsapp}
                onValueChange={setShowWhatsapp}
              />
              <SettingsSwitchItem
                icon={HideIcon}
                title="اخفاء النشاط"
                value={hideActivity}
                onValueChange={setHideActivity}
              />
              <SettingsSwitchItem
                icon={HideAdIcon}
                title="اخفاء اعلانات المكاتب"
                value={hideOfficeAds}
                onValueChange={setHideOfficeAds}
              />
            </View>
          </View>

          {/* --- Section: Support & Help --- */}
          <View>
            <Text
              className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              الدعم والمساعدة
            </Text>
            <View className="rounded-xl bg-[#F9FAFE] px-4">
              <MenuItem
                icon={InfoIcon}
                title="عن بيوتنا"
                onPress={() => router.push('/about')}
              />
              <MenuItem
                icon={ShowIcon}
                title="الأسئلة الشائعة"
                onPress={() => console.log('Navigate to FAQs')}
              />
              <MenuItem
                icon={CallIcon}
                title="تواصل معنا"
                onPress={() => router.push('/contact')}
              />
            </View>
          </View>

          {/* --- Section: Policies --- */}
          <View>
            <Text
              className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              السياسات
            </Text>
            <View className="rounded-xl bg-[#F9FAFE] px-4">
              <MenuItem
                icon={PrivacyIcon}
                title="سياسة الخصوصية"
                onPress={() => router.push('/privacy')}
              />
              <MenuItem
                icon={TermsIcon}
                title="الشروط والأحكام"
                onPress={() => router.push('/terms')}
              />
            </View>
          </View>

          {/* --- Action Buttons --- */}
          <View className="mt-4 gap-3">
            {/* Delete Account */}
            <TouchableOpacity
              onPress={() => console.log('Delete account clicked')}
              className="h-[44px] flex-row items-center justify-center gap-2 rounded-full border border-[#9C1E28] bg-white leading-[22px]"
            >
              <Feather name="user-x" size={18} color="#9C1E28" />
              <Text className="font-cairo-semibold text-[14px] leading-[24px] text-[#9C1E28]">
                حذف الحساب
              </Text>
            </TouchableOpacity>

            {/* Temporarily Disable Account */}
            <TouchableOpacity
              onPress={() => console.log('Disable account clicked')}
              className="h-[44px] flex-row items-center justify-center gap-2 rounded-full border border-[#B97500] bg-white"
            >
              <Feather name="pause-circle" size={18} color="#B97500" />
              <Text className="font-cairo-semibold text-[14px] leading-[24px] text-[#B97500]">
                تعطيل الحساب مؤقتا
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
