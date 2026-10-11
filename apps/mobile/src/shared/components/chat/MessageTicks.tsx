import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';

import { DoubleTickIcon } from '@/assets/icons/chat';
import { MessageStatus } from '@/shared/utils/chatReceipts';

interface MessageTicksProps {
  // Null: nothing (their message, or a failed send)
  status?: MessageStatus | null;
  size?: number;
}

const GREY = '#94A3B8';
// Delivered: the design's navy double tick
const DELIVERED_COLOR = '#15304D';
// Read: Buyootna gold
export const READ_COLOR = '#B28648';

/**
 * Like WhatsApp: 🕓 sending, ✓ sent, ✓✓ delivered (navy), ✓✓ read (gold).
 * The double tick is the Figma icon (4410:168623).
 */
export default function MessageTicks({ status, size = 14 }: MessageTicksProps) {
  if (!status) return null;
  if (status === 'sending') {
    return <Feather testID="ticks-sending" name="clock" size={size - 2} color={GREY} />;
  }
  if (status === 'sent') {
    return <Feather testID="ticks-sent" name="check" size={size} color={GREY} />;
  }
  return (
    <View
      testID={`ticks-${status}`}
      accessibilityLabel={status === 'read' ? 'تمت القراءة' : 'تم التسليم'}
    >
      <DoubleTickIcon
        size={size + 6}
        color={status === 'read' ? READ_COLOR : DELIVERED_COLOR}
      />
    </View>
  );
}
