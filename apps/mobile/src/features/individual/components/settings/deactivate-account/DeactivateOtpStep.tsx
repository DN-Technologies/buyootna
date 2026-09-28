import { Feather } from '@expo/vector-icons';
import { RefObject } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { OTP_LENGTH } from './constants';
import DeactivateSheetActions from './DeactivateSheetActions';
import { formatCountdown } from './format';
import OtpCodeInput from './OtpCodeInput';

interface DeactivateOtpStepProps {
  // Masked phone or email the code went to
  destination: string;
  otp: string;
  onChangeOtp: (digits: string) => void;
  otpInputRef: RefObject<TextInput | null>;
  countdown: number;
  onResend: () => void;
  errorMessage: string | null;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

// Step 3: confirm with the code sent by SMS or email (Figma 1684:60280)
export default function DeactivateOtpStep({
  destination,
  otp,
  onChangeOtp,
  otpInputRef,
  countdown,
  onResend,
  errorMessage,
  isLoading,
  onConfirm,
  onClose,
}: DeactivateOtpStepProps) {
  return (
    <View testID="deactivate-step-otp" className="flex-1 justify-between">
      {/* Header */}
      <View className="mb-2 flex-row items-center justify-between border-b border-[#ECECEC] pb-3">
        <TouchableOpacity
          testID="deactivate-otp-close"
          onPress={onClose}
          className="h-8 w-8 items-center justify-center rounded-full bg-gray-50"
        >
          <Feather name="x" size={20} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-[18px] text-[#111111]">
          تحقق من الرقم
        </Text>
        <View className="h-8 w-8" />
      </View>

      <View className="items-center px-2 py-3">
        <Text
          className="mb-4 text-center font-cairo text-[14px] leading-[22px] text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
        >
          {`أرسلنا رمز التحقق المكون من 6 ارقام إلى  ${destination}`}
        </Text>

        {/* Countdown / resend */}
        <View className="mb-6 flex-row items-center justify-center gap-1.5">
          {countdown > 0 ? (
            <>
              <Text className="font-cairo text-[14px] text-[#A0A0A0]">
                اعادة ارسال الرمز
              </Text>
              <Text className="font-cairo-semibold text-[14px] text-[#15304D]">
                خلال {formatCountdown(countdown)}
              </Text>
            </>
          ) : (
            <TouchableOpacity testID="deactivate-otp-resend" onPress={onResend}>
              <Text className="font-cairo-semibold text-[14px] text-[#15304D] underline">
                اعادة ارسال الرمز
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <OtpCodeInput ref={otpInputRef} value={otp} onChange={onChangeOtp} />

        {errorMessage && (
          <Text
            testID="deactivate-otp-error"
            className="mt-1 font-cairo text-xs text-red-500"
          >
            {errorMessage}
          </Text>
        )}
      </View>

      <View className="border-t border-[#ECECEC] pt-4">
        <DeactivateSheetActions
          className="w-full"
          primaryLabel="تأكيد التعطيل"
          primaryTestID="deactivate-otp-confirm"
          primaryDisabled={otp.length < OTP_LENGTH}
          isLoading={isLoading}
          onPrimary={onConfirm}
        />
      </View>
    </View>
  );
}
