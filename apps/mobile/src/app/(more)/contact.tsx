import { Feather, FontAwesome } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { BuyootnaLogoDark } from '@/assets/icons';

// Gmail multicolored logo component
const GmailIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size * (18 / 24)} viewBox="0 0 24 18" fill="none">
    {/* Left leg: Blue */}
    <Path d="M0 2.5v13.5c0 1.1.9 2 2 2h3V4.5L0 2.5z" fill="#4285F4" />
    {/* Right leg: Green */}
    <Path d="M24 2.5v13.5c0 1.1-.9 2-2 2h-3V4.5l5-2z" fill="#34A853" />
    {/* V shape: Red */}
    <Path d="M19 4.5l-7 5-7-5v13h14V4.5z" fill="#EA4335" />
    {/* Top shoulders: Dark Red / Yellow */}
    <Path d="M2 1.5l10 7.5 10-7.5c-.6-.4-1.3-.5-2-.5H4c-.7 0-1.4.1-2 .5z" fill="#C5221F" />
  </Svg>
);

export default function ContactUsScreen() {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast(`تم نسخ ${label}`);
    } catch (error) {
      console.log('Clipboard error:', error);
    }
  };

  const openWhatsApp = () => {
    Linking.openURL('whatsapp://send?phone=96501234969558').catch(() => {
      // Fallback to web link if app not installed
      Linking.openURL('https://wa.me/96501234969558');
    });
  };

  const openDialer = () => {
    Linking.openURL('tel:01234969558');
  };

  const openEmail = () => {
    Linking.openURL('mailto:byoutna@gmail.com');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-50">
        <View className="w-8" />
        <Text className="font-cairo-semibold text-lg text-[#111111]">
          تواصل معنا
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 40,
        }}
      >
        {/* Logo Section */}
        <View className="mb-6 items-center">
          <BuyootnaLogoDark width={120} height={102} />
        </View>

        {/* Intro text */}
        <Text
          className="font-cairo text-sm leading-[22px] text-[#333333] text-center mb-8 px-2"
          style={{ writingDirection: 'rtl' }}
        >
          لا تتردد في الاتصال بنا؛ سواء كان لديك اقتراح لتحسين خدماتنا، أو شكوى ترغب في مناقشتها، أو مشكلة تحتاج إلى حل.
        </Text>

        {/* Subtitle */}
        <Text
          className="font-cairo-semibold text-base text-[#111111] text-right mb-4"
          style={{ writingDirection: 'rtl' }}
        >
          معلومات التواصل
        </Text>

        {/* Cards */}
        <View className="gap-4">
          {/* WhatsApp Card */}
          <TouchableOpacity
            onPress={openWhatsApp}
            activeOpacity={0.7}
            className="flex-row items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <TouchableOpacity
              onPress={() => copyToClipboard('01234969558', 'رقم الواتساب')}
              className="p-2.5 rounded-xl bg-gray-50 border border-gray-100"
            >
              <Feather name="link-2" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View className="flex-1 items-end justify-center mr-4">
              <Text className="font-cairo-semibold text-xs text-[#94A3B8]">
                واتساب
              </Text>
              <Text className="font-cairo-semibold text-[#111111] mt-1 text-right text-[15px]">
                01234969558
              </Text>
            </View>

            <View className="w-12 h-12 rounded-2xl bg-[#4CD964] items-center justify-center">
              <FontAwesome name="whatsapp" size={26} color="white" />
            </View>
          </TouchableOpacity>

          {/* Support Number Card */}
          <TouchableOpacity
            onPress={openDialer}
            activeOpacity={0.7}
            className="flex-row items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <TouchableOpacity
              onPress={() => copyToClipboard('01234969558', 'رقم الدعم')}
              className="p-2.5 rounded-xl bg-gray-50 border border-gray-100"
            >
              <Feather name="link-2" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View className="flex-1 items-end justify-center mr-4">
              <Text className="font-cairo-semibold text-xs text-[#94A3B8]">
                رقم الدعم
              </Text>
              <Text className="font-cairo-semibold text-[#111111] mt-1 text-right text-[15px]">
                01234969558
              </Text>
            </View>

            <View className="w-12 h-12 rounded-2xl bg-[#15304D] items-center justify-center">
              <Feather name="phone" size={22} color="white" />
            </View>
          </TouchableOpacity>

          {/* Email Card */}
          <TouchableOpacity
            onPress={openEmail}
            activeOpacity={0.7}
            className="flex-row items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <TouchableOpacity
              onPress={() => copyToClipboard('byoutna@gmail.com', 'البريد الإلكتروني')}
              className="p-2.5 rounded-xl bg-gray-50 border border-gray-100"
            >
              <Feather name="link-2" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View className="flex-1 items-end justify-center mr-4">
              <Text className="font-cairo-semibold text-xs text-[#94A3B8]">
                البريد الالكتروني
              </Text>
              <Text className="font-cairo-semibold text-[#111111] mt-1 text-right text-[15px]">
                byoutna@gmail.com
              </Text>
            </View>

            <View
              className="w-12 h-12 rounded-2xl bg-white items-center justify-center border border-gray-100"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 1,
                elevation: 0.5,
              }}
            >
              <GmailIcon size={24} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Copy Toast feedback */}
      {toastMessage && (
        <View
          className="absolute bottom-10 left-6 right-6 bg-[#15304D] rounded-xl py-3 items-center justify-center shadow-lg"
          style={{ zIndex: 999 }}
        >
          <Text className="font-cairo-medium text-white text-sm">
            {toastMessage}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
