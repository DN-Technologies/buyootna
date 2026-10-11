import { Feather } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

import { AttachPlusIcon } from '@/assets/icons/chat';

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
      {/* Lifted to the middle of the 46px field the row is bottom-aligned to */}
      <View className="relative -top-[7px]">
        {panelOpen ? (
          <Feather name="type" size={20} color="#111111" />
        ) : (
          <AttachPlusIcon />
        )}
      </View>
    </TouchableOpacity>
  );
}
