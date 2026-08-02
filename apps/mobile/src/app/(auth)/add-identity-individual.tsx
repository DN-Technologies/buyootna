import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import apiClient from '@/shared/api/api';
import FormInput from '@/shared/components/FormInput';
import { useAuthStore } from '@/shared/store/useAuthStore';

const individualIdentitySchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون أكثر من حرفين'),
  whatsapp: z.string().min(8, 'رقم الواتساب غير صالح').optional().or(z.literal('')),
});

type IndividualIdentityValues = z.infer<typeof individualIdentitySchema>;

export default function AddIdentityIndividualScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  const { control, handleSubmit } = useForm<IndividualIdentityValues>({
    resolver: zodResolver(individualIdentitySchema),
    defaultValues: {
      name: '',
      whatsapp: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: IndividualIdentityValues) => {
    setIsLoading(true);
    try {
      await apiClient.post('/identities/individual', {
        name: data.name,
        whatsapp: data.whatsapp || undefined,
      });

      // Refresh store to include the new identity
      await refreshProfile();

      Alert.alert('تم بنجاح', 'تم إضافة الهوية الفردية بنجاح', [
        {
          text: 'حسناً',
          onPress: () => router.replace('/(individual)/more'),
        },
      ]);
    } catch (error: any) {
      let errorMsg = 'حدث خطأ أثناء إضافة الهوية';
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        errorMsg = Array.isArray(message) ? message.join('\n') : message;
      }
      Alert.alert('خطأ', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pb-4 pt-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          >
            <Feather name="arrow-right" size={20} color="#111111" />
          </TouchableOpacity>
          <Text className="font-cairo-bold text-lg text-charcoal">
            إضافة هوية فردية
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="mb-6 text-right font-cairo-medium text-sm text-gray-medium">
            يرجى إدخال البيانات التالية لإنشاء الهوية الفردية الخاصة بك
          </Text>

          <FormInput
            control={control}
            name="name"
            label="الاسم الكامل"
            placeholder="مثال: محمد أحمد"
          />

          <FormInput
            control={control}
            name="whatsapp"
            label="رقم الواتساب (اختياري)"
            placeholder="مثال: 96512345678"
            keyboardType="phone-pad"
            isRequired={false}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            className={`mt-8 h-[48px] w-full items-center justify-center rounded-3xl bg-primary ${
              isLoading ? 'bg-primary/70' : 'bg-primary'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="font-cairo-semibold text-[14px] leading-[24px] text-white">
                تأكيد وإضافة الهوية
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
