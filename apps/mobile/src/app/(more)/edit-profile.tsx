import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
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

import AvatarPicker from '@/core/components/more/AvatarPicker';
import { useAuthStore } from '@/store/useAuthStore';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  avatarUrl: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const derivedName =
    user?.name || (user?.email ? user.email.split('@')[0] : 'غير معروف');

  // Initialize React Hook Form
  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid, errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: derivedName,
      email: user?.email || '',
      phone: user?.phone || '',
      whatsapp: user?.phone || '',
      avatarUrl: user?.avatarUrl || 'https://via.placeholder.com/150',
    },
    mode: 'onChange', // Validates on every keystroke to update button state
  });

  const onSubmit = (data: ProfileFormData) => {
    // We will wire this up to the API in Card 4
    console.log('Valid and Dirty Form Submitted:', data);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* --- 1. Header --- */}
        <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-4">
          <TouchableOpacity onPress={() => router.back()} className="w-8">
            <Feather name="chevron-right" size={24} color="#111111" />
          </TouchableOpacity>
          <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
            تعديل الملف الشخصي
          </Text>
          <View className="w-8" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* --- 2. Avatar Section --- */}
          <Controller
            control={control}
            name="avatarUrl"
            render={({ field: { onChange, value } }) => (
              <AvatarPicker
                currentAvatarUrl={value}
                onUploadSuccess={onChange}
              />
            )}
          />

          {/* --- 3. Form Inputs --- */}
          <View className="gap-5 px-5">
            {/* Name Input */}
            <View>
              <Text
                className="mb-2 font-cairo-medium text-xs text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                الاسم
              </Text>
              <Controller
                control={control}
                name="name"
                rules={{ required: 'الاسم مطلوب' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl bg-white px-4 py-3.5 text-right font-cairo-medium text-[#111111]`}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="أدخل اسمك"
                    textAlign="right"
                  />
                )}
              />
            </View>

            {/* Email Input */}
            <View>
              <Text
                className="mb-2 font-cairo-medium text-xs text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                البريد الالكتروني
              </Text>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'البريد الالكتروني مطلوب',
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: 'بريد الكتروني غير صالح',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl bg-white px-4 py-3.5 text-right font-cairo-medium text-[#111111]`}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="example@gmail.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    textAlign="right"
                  />
                )}
              />
            </View>

            {/* Phone Input (Compound) */}
            <View>
              <Text
                className="mb-2 font-cairo-medium text-xs text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                رقم الهاتف
              </Text>
              <View className="flex-row gap-2">
                <Controller
                  control={control}
                  name="phone"
                  rules={{ required: 'رقم الهاتف مطلوب', minLength: 8 }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`flex-1 border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-xl bg-white px-4 py-3.5 text-right font-cairo-medium text-[#111111]`}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="phone-pad"
                      textAlign="right"
                    />
                  )}
                />
                {/* Country Code Dropdown */}
                <TouchableOpacity className="w-24 flex-row items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3">
                  <Text className="font-cairo-medium text-sm leading-[22px] text-[#64748B]">
                    +965
                  </Text>
                  <Feather name="chevron-down" size={16} color="#111111" />
                </TouchableOpacity>
              </View>
            </View>

            {/* WhatsApp Input (Compound) */}
            <View>
              <Text
                className="mb-2 font-cairo-medium text-xs text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                رقم الواتساب
              </Text>
              <View className="flex-row gap-2">
                <Controller
                  control={control}
                  name="whatsapp"
                  rules={{ required: 'رقم الواتساب مطلوب', minLength: 8 }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`flex-1 border ${errors.whatsapp ? 'border-red-500' : 'border-gray-200'} rounded-xl bg-white px-4 py-3.5 text-right font-cairo-medium text-[#111111]`}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="phone-pad"
                      textAlign="right"
                    />
                  )}
                />
                {/* Country Code Dropdown */}
                <TouchableOpacity className="w-24 flex-row items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3">
                  <Text className="font-cairo-medium text-sm leading-[22px] text-[#64748B]">
                    +965
                  </Text>
                  <Feather name="chevron-down" size={16} color="#111111" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* --- 4. Dynamic Sticky Submit Button --- */}
        <View className="border-t border-gray-50 bg-white px-5 py-4">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || !isValid}
            className={`h-[48px] w-full items-center justify-center rounded-[24px] ${
              isDirty && isValid ? 'bg-[#15304D]' : 'bg-[#A6A6A6]'
            }`}
          >
            <Text className="font-cairo-bold text-[15px] text-white">
              تعديل البيانات
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
