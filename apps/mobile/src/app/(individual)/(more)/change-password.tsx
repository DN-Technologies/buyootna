import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import FormInput from '@/shared/components/FormInput';
import { settingsService } from '@/shared/api/settings.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

// Validation Schema
const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
    newPassword: z
      .string()
      .min(6, 'يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل'),
    confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
    logoutAllDevices: z.boolean(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'كلمة المرور الجديدة غير متطابقة',
    path: ['confirmPassword'],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Bottom Sheet Ref & States
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const otpInputRef = useRef<TextInput>(null);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [timer, setTimer] = useState(45);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const { control, handleSubmit, getValues } =
    useForm<ChangePasswordFormValues>({
      resolver: zodResolver(changePasswordSchema),
      defaultValues: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
        logoutAllDevices: false,
      },
    });

  // Mask Phone for display in Arabic RTL layout
  const maskedPhone = useMemo(() => {
    if (!user?.phone) return '•••• ••••';
    const phone = user.phone;
    if (phone.length > 4) {
      return phone.slice(0, phone.length - 4) + '••••';
    }
    return '••••';
  }, [user?.phone]);

  // Handle Form Submission - Requests OTP
  const onSubmitForm = async () => {
    setIsRequestingOtp(true);
    try {
      await settingsService.requestChangePasswordOtp();
      setTimer(45);
      setOtp('');
      setOtpError('');
      bottomSheetRef.current?.present();
    } catch (e: any) {
      Alert.alert(
        'خطأ',
        e.response?.data?.message ||
          'فشل إرسال رمز التحقق. يرجى المحاولة لاحقاً.',
      );
    } finally {
      setIsRequestingOtp(false);
    }
  };

  // Resend OTP Action
  const handleResendOtp = async () => {
    try {
      await settingsService.requestChangePasswordOtp();
      setTimer(45);
      setOtp('');
      setOtpError('');
      Alert.alert('نجاح', 'تم إعادة إرسال رمز التحقق بنجاح');
    } catch (e: any) {
      Alert.alert('خطأ', e.response?.data?.message || 'فشل إعادة إرسال الرمز.');
    }
  };

  // Final Code Verification & Password Change
  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setOtpError('الرجاء إدخال رمز التحقق المكون من 6 أرقام كاملاً');
      return;
    }
    setOtpError('');
    setIsSubmitting(true);
    const { oldPassword, newPassword, logoutAllDevices } = getValues();
    try {
      await settingsService.changePassword(
        oldPassword,
        newPassword,
        otp,
        logoutAllDevices,
      );
      bottomSheetRef.current?.dismiss();
      Alert.alert('نجاح', 'تم تغيير كلمة المرور بنجاح', [
        {
          text: 'موافق',
          onPress: () => router.back(),
        },
      ]);
    } catch (e: any) {
      setOtpError(
        e.response?.data?.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Timer Countdown Logic
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const snapPoints = useMemo(() => ['55%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* --- Header --- */}
      <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-4">
        <TouchableOpacity onPress={() => router.back()} className="w-8">
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
          تغيير كلمة المرور
        </Text>
        <View className="w-8" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
            paddingTop: 20,
            paddingHorizontal: 20,
          }}
          className="flex-1"
        >
          <View className="mb-6">
            <FormInput
              control={control}
              name="oldPassword"
              label="كلمة المرور الحالية"
              isPassword
              placeholder="أدخل كلمة المرور الحالية"
              isRequired
            />

            <FormInput
              control={control}
              name="newPassword"
              label="كلمة المرور الجديدة"
              isPassword
              placeholder="أدخل كلمة المرور الجديدة"
              isRequired
            />

            <FormInput
              control={control}
              name="confirmPassword"
              label="تأكيد كلمة المرور"
              isPassword
              placeholder="أعد إدخال كلمة المرور الجديدة"
              isRequired
            />

            {/* Logout all devices option */}
            <Controller
              control={control}
              name="logoutAllDevices"
              render={({ field: { value, onChange } }) => (
                <View className="mt-4 flex-row items-center justify-between border-t border-gray-50 pt-4">
                  {/* Right label */}
                  <Text className="font-cairo-medium text-[14px] text-[#111111]">
                    تسجيل الخروج من جميع الأجهزة
                  </Text>
                  {/* Left toggle switch */}
                  <Switch
                    value={!!value}
                    onValueChange={onChange}
                    trackColor={{ false: '#E2E8F0', true: '#15304D' }}
                    thumbColor="#FFFFFF"
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
                </View>
              )}
            />
          </View>

          {/* Action button at the bottom of form */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit(onSubmitForm)}
            disabled={isRequestingOtp}
            className="mt-6 h-14 w-full items-center justify-center rounded-full bg-[#15304D] shadow-sm"
          >
            {isRequestingOtp ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="font-cairo-bold text-base text-white">
                تحديث كلمة المرور
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- OTP verification bottom sheet --- */}
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 40 }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 28 }}
      >
        <BottomSheetView className="flex-1 px-6 pb-8 pt-4">
          {/* Close button X */}
          <View className="mb-4 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => bottomSheetRef.current?.dismiss()}
              className="p-1"
            >
              <Feather name="x" size={22} color="#111111" />
            </TouchableOpacity>
            <Text className="font-cairo-bold text-lg text-[#111111]">
              تحقق من الرقم
            </Text>
            <View className="w-8" />
          </View>

          {/* Description and Masked Phone */}
          <Text className="mb-8 px-4 text-center font-cairo-medium text-sm text-[#6B6A6A]">
            أرسلنا رمز التحقق المكون من 6 أرقام إلى {maskedPhone}
          </Text>

          {/* OTP boxes container */}
          <View className="mb-6 w-full items-center">
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => otpInputRef.current?.focus()}
              className="w-full flex-row justify-between px-2"
              style={{ direction: 'ltr' }}
            >
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <View
                  key={index}
                  className={`h-14 w-12 items-center justify-center rounded-xl border-[1.5px] bg-white ${
                    otp.length === index
                      ? 'border-[#15304D]'
                      : otpError
                        ? 'border-red-500'
                        : 'border-gray-300'
                  }`}
                >
                  <Text className="font-cairo-bold text-xl text-[#111111]">
                    {otp[index] || ''}
                  </Text>
                </View>
              ))}
            </TouchableOpacity>

            {/* Hidden Input */}
            <TextInput
              ref={otpInputRef}
              value={otp}
              onChangeText={(text) => {
                const clean = text.replace(/[^0-9]/g, '');
                if (clean.length <= 6) setOtp(clean);
              }}
              keyboardType="number-pad"
              maxLength={6}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                opacity: 0,
              }}
              pointerEvents="none"
              autoFocus
            />

            {otpError !== '' && (
              <Text className="mt-4 text-center font-cairo-semibold text-xs text-red-500">
                {otpError}
              </Text>
            )}
          </View>

          {/* Timer details */}
          <View className="mb-8 items-center">
            {timer > 0 ? (
              <Text className="font-cairo-semibold text-sm text-[#6B6A6A]">
                إعادة إرسال الرمز خلال 00:{timer.toString().padStart(2, '0')}
              </Text>
            ) : (
              <TouchableOpacity activeOpacity={0.7} onPress={handleResendOtp}>
                <Text className="font-cairo-bold text-sm text-[#15304D] underline">
                  إعادة إرسال الرمز
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Verification submit button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleVerifyOtp}
            disabled={otp.length < 6 || isSubmitting}
            className={`h-12 w-full items-center justify-center rounded-full ${
              otp.length < 6 || isSubmitting ? 'bg-[#A6A6A6]' : 'bg-[#15304D]'
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="font-cairo-semibold text-[14px] leading-[24px] text-white">
                التحقق من الرمز
              </Text>
            )}
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
