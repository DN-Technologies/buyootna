import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthLockViewProps {
  onLoginPress: () => void;
}

export default function AuthLockView({ onLoginPress }: AuthLockViewProps) {
  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top', 'left', 'right']}>
      {/* --- Header --- */}
      <View className="flex-row items-center justify-between px-5 py-4 ">
        <View className="" />
        <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
          نشاطي
        </Text>
        <View className="w-10 h-10" />
      </View>

      {/* --- Lock Container --- */}
      <View className="flex-1 items-center justify-center px-6 pb-20">
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-[#15304D]/10">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-[#15304D]">
            <Feather name="lock" size={30} color="white" />
          </View>
        </View>

        <Text className="mb-3 font-cairo-bold text-xl text-[#15304D] text-center">
          تسجيل الدخول مطلوب
        </Text>

        <Text className="mb-8 font-cairo text-[14px] leading-6 text-[#6B6A6A] text-center">
          يرجى تسجيل الدخول إلى حسابك لتتمكن من إضافة عقاراتك وإدارة مسوداتك، ومتابعة عروضك وتنبيهاتك أولاً بأول.
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onLoginPress}
          className="h-[52px] w-full items-center justify-center rounded-full bg-[#15304D]"
          style={styles.loginButton}
        >
          <Text className="font-cairo-semibold text-[15px] text-white">
            تسجيل الدخول أو إنشاء حساب
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loginButton: {
    shadowColor: '#15304D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
});
