import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/store/useAuthStore';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [name, setName] = useState('محمد الحاتم');
  const [email, setEmail] = useState(user?.email || 'mohamedelotby@gmail.com');
  const [phone, setPhone] = useState(user?.phone || '96590000000+');

  const handleSave = () => {
    // Save logic placeholder
    console.log('Saving profile data:', { name, email, phone });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 px-5 py-4">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-50"
        >
          <Feather name="arrow-left" size={20} color="#111" />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-lg text-[#111]">تعديل الملف الشخصي</Text>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-5 py-8">
            {/* Avatar Section */}
            <View className="items-center mb-8">
              <View className="relative">
                <View className="h-24 w-24 overflow-hidden rounded-full border-4 border-gray-100 bg-gray-200">
                  {/* Avatar image can be integrated here */}
                  <View className="h-full w-full items-center justify-center bg-gray-100">
                    <Feather name="user" size={40} color="#94A3B8" />
                  </View>
                </View>
                <TouchableOpacity className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-[#15304D] border-2 border-white shadow-sm">
                  <Feather name="camera" size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
              <Text className="mt-3 font-cairo-semibold text-sm text-[#15304D]">
                تغيير الصورة الشخصية
              </Text>
            </View>

            {/* Form Fields */}
            <View className="space-y-6">
              {/* Full Name */}
              <View className="items-end">
                <Text className="mb-2 font-cairo-bold text-xs text-[#64748B]">
                  الاسم الكامل
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="أدخل الاسم الكامل"
                  placeholderTextColor="#94A3B8"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-right font-cairo text-sm text-[#111] focus:border-[#15304D]"
                />
              </View>

              {/* Email Address */}
              <View className="items-end mt-4">
                <Text className="mb-2 font-cairo-bold text-xs text-[#64748B]">
                  البريد الإلكتروني
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="example@domain.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-right font-cairo text-sm text-[#111] focus:border-[#15304D]"
                />
              </View>

              {/* Phone Number */}
              <View className="items-end mt-4">
                <Text className="mb-2 font-cairo-bold text-xs text-[#64748B]">
                  رقم الهاتف
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="965XXXXXXXX+"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-right font-cairo text-sm text-[#111] focus:border-[#15304D]"
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSave}
              className="mt-12 w-full items-center justify-center rounded-xl bg-[#15304D] py-4"
            >
              <Text className="font-cairo-bold text-base text-white">حفظ التعديلات</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
