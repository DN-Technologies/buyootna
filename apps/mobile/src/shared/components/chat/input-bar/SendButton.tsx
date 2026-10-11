import { TouchableOpacity, View } from 'react-native';

import { SendIcon } from '@/assets/icons/chat';

interface SendButtonProps {
  hasText: boolean;
  disabled: boolean;
  onPress: () => void;
}

export default function SendButton({
  hasText,
  disabled,
  onPress,
}: SendButtonProps) {
  return (
    <TouchableOpacity
      testID="chat-send-button"
      accessibilityLabel="إرسال"
      onPress={onPress}
      disabled={disabled}
      className="h-8 w-8 items-center justify-center"
    >
      {/* The asset points right; under RTL the plane flies left */}
      <View className="relative -top-[7px]" style={{ transform: [{ scaleX: -1 }] }}>
        <SendIcon color={hasText && !disabled ? '#15304D' : '#94A3B8'} />
      </View>
    </TouchableOpacity>
  );
}
