import { Text, TouchableOpacity } from 'react-native';

interface PhoneVerificationHintProps {
  phoneChanged: boolean;
  needsVerification: boolean;
  onVerify: () => void;
}

// Under the phone field: a new number will get a code on save; a saved
// number that isn't verified can be verified now
export default function PhoneVerificationHint({
  phoneChanged,
  needsVerification,
  onVerify,
}: PhoneVerificationHintProps) {
  if (phoneChanged) {
    return (
      <Text
        className="mt-1.5 font-cairo text-xs text-[#6B6A6A]"
        style={{ writingDirection: 'rtl' }}
      >
        سنرسل رمز تحقق إلى الرقم الجديد عند الحفظ
      </Text>
    );
  }
  if (!needsVerification) return null;
  return (
    <TouchableOpacity
      testID="verify-phone-link"
      onPress={onVerify}
      className="mt-1.5 self-start"
    >
      <Text className="font-cairo-semibold text-xs text-[#15304D] underline">
        الرقم غير موثق — تحقق من الرقم
      </Text>
    </TouchableOpacity>
  );
}
