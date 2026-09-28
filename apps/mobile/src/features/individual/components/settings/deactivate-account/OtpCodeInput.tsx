import { forwardRef } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { OTP_LENGTH } from './constants';

interface OtpCodeInputProps {
  value: string;
  onChange: (digits: string) => void;
}

// Six boxes over a hidden native input, so the system keyboard and SMS
// autofill still work
const OtpCodeInput = forwardRef<TextInput, OtpCodeInputProps>(
  ({ value, onChange }, ref) => {
    const focus = () => {
      if (ref && 'current' in ref) ref.current?.focus();
    };

    return (
      <>
        <TouchableOpacity
          testID="deactivate-otp-boxes"
          activeOpacity={1}
          onPress={focus}
          className="mb-3 w-full flex-row justify-between"
          style={{ direction: 'ltr' }}
        >
          {Array.from({ length: OTP_LENGTH }, (_, index) => {
            const digit = value[index] || '';
            const isCurrent = value.length === index;
            return (
              <View
                key={index}
                className={`h-[48px] w-[46px] items-center justify-center rounded-[6px] border bg-white ${
                  isCurrent || digit ? 'border-[#15304D]' : 'border-[#ECECEC]'
                }`}
              >
                <Text className="font-cairo-semibold text-[18px] text-[#111111]">
                  {digit}
                </Text>
              </View>
            );
          })}
        </TouchableOpacity>

        <TextInput
          ref={ref}
          testID="deactivate-otp-input"
          value={value}
          onChangeText={(text) => {
            const clean = text.replace(/[^0-9]/g, '');
            if (clean.length <= OTP_LENGTH) onChange(clean);
          }}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          maxLength={OTP_LENGTH}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0,
          }}
          pointerEvents="none"
          autoFocus
        />
      </>
    );
  },
);

OtpCodeInput.displayName = 'OtpCodeInput';

export default OtpCodeInput;
