import { Text, TouchableOpacity } from 'react-native';

// Under the email field: a new address has to be verified before saving
export default function EmailVerificationHint({
  visible,
  onSend,
}: {
  visible: boolean;
  onSend: () => void;
}) {
  if (!visible) return null;
  return (
    <TouchableOpacity
      testID="send-email-otp-link"
      onPress={onSend}
      className="mt-1.5 self-start"
    >
      <Text className="font-cairo-semibold text-xs text-[#15304D] underline">
        ارسال رمز التحقق
      </Text>
    </TouchableOpacity>
  );
}
