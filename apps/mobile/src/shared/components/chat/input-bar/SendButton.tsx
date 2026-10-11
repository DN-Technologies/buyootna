import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

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
      onPress={onPress}
      disabled={disabled}
      className="h-8 w-8 items-center justify-center"
    >
      <Feather
        name="send"
        size={24}
        color={hasText && !disabled ? '#15304D' : '#94A3B8'}
        className="relative -top-1"
      />
    </TouchableOpacity>
  );
}
