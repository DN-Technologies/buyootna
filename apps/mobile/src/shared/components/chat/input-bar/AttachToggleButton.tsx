import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

interface AttachToggleButtonProps {
  panelOpen: boolean;
  onPress: () => void;
}

/** "+" swaps the keyboard for the attachment panel (and back). */
export default function AttachToggleButton({
  panelOpen,
  onPress,
}: AttachToggleButtonProps) {
  return (
    <TouchableOpacity
      testID="chat-attach-button"
      accessibilityLabel={panelOpen ? 'لوحة المفاتيح' : 'إرفاق'}
      className="h-8 w-8 items-center justify-center"
      onPress={onPress}
    >
      <Feather
        name={panelOpen ? 'type' : 'plus'}
        size={panelOpen ? 20 : 24}
        color="#111111"
        className="relative -top-2.5"
      />
    </TouchableOpacity>
  );
}
