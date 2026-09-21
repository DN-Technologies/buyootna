import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface ChangePasswordOtpSheetProps {
  otpInputRef?: React.RefObject<TextInput | null>;
  otp: string;
  onOtpChange: (text: string) => void;
  otpError: string;
  maskedPhone: string;
  secondsLeft: number;
  isReady: boolean;
  limitReachedMessage: string | null;
  onResendOtp: () => void;
  onVerifyOtp: () => void;
  isSubmitting: boolean;
  onClose?: () => void;
}

export const ChangePasswordOtpSheet = forwardRef<
  BottomSheetModal,
  ChangePasswordOtpSheetProps
>(
  (
    {
      otpInputRef,
      otp,
      onOtpChange,
      otpError,
      maskedPhone,
      secondsLeft,
      isReady,
      limitReachedMessage,
      onResendOtp,
      onVerifyOtp,
      isSubmitting,
      onClose,
    },
    ref,
  ) => {
    // 80% — deliberately tall so the OTP boxes and submit button sit above
    // any keyboard BY GEOMETRY: gorhom's internal keyboard handling
    // (keyboardBehavior) proved inert under the new architecture (Fabric),
    // so keep the keyboard props as best-effort headroom but never rely on
    // them to keep this sheet's content visible.
    const snapPoints = useMemo(() => ['80%'], []);

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

    const handleClose = () => {
      if (onClose) {
        onClose();
      } else if (ref && 'current' in ref && ref.current) {
        ref.current.dismiss();
      }
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        // The sheet must sit fully above the keyboard: "extend" grows it to
        // clear the keyboard instead of leaving the OTP boxes underneath it
        // (the reported bug). The other two props match every other input
        // sheet in the app.
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 40 }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 28 }}
      >
        <BottomSheetView className="flex-1 px-6 pb-8 pt-4">
          {/* Close button X */}
          <View className="mb-4 flex-row items-center justify-between">
            <TouchableOpacity onPress={handleClose} className="p-1">
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
              onPress={() => otpInputRef?.current?.focus()}
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
              testID="otp-hidden-input"
              value={otp}
              onChangeText={(text) => {
                const clean = text.replace(/[^0-9]/g, '');
                if (clean.length <= 6) onOtpChange(clean);
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
            />

            {otpError !== '' && (
              <Text className="mt-4 text-center font-cairo-semibold text-xs text-red-500">
                {otpError}
              </Text>
            )}
          </View>

          {/* Timer details */}
          <View className="mb-8 items-center">
            {limitReachedMessage ? (
              <Text className="px-4 text-center font-cairo-semibold text-sm text-red-500">
                {limitReachedMessage}
              </Text>
            ) : isReady ? (
              <TouchableOpacity activeOpacity={0.7} onPress={onResendOtp}>
                <Text className="font-cairo-bold text-sm text-[#15304D] underline">
                  إعادة إرسال الرمز
                </Text>
              </TouchableOpacity>
            ) : (
              <Text className="font-cairo-semibold text-sm text-[#6B6A6A]">
                إعادة إرسال الرمز خلال{' '}
                {Math.floor(secondsLeft / 60)
                  .toString()
                  .padStart(2, '0')}
                :{(secondsLeft % 60).toString().padStart(2, '0')}
              </Text>
            )}
          </View>

          {/* Verification submit button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onVerifyOtp}
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
    );
  },
);

ChangePasswordOtpSheet.displayName = 'ChangePasswordOtpSheet';

export default ChangePasswordOtpSheet;
