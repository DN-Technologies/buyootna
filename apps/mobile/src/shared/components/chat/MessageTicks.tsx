import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';

import { MessageStatus } from '@/shared/utils/chatReceipts';

interface MessageTicksProps {
  // Null: nothing (their message, or a failed send)
  status?: MessageStatus | null;
  size?: number;
}

const GREY = '#94A3B8';
// Read: Buyootna gold
export const READ_COLOR = '#B28648';

/**
 * Like WhatsApp: 🕓 sending, ✓ sent, ✓✓ delivered (grey), ✓✓ read (gold).
 * The double tick is two overlapping checks, so no extra icon font is needed.
 */
export default function MessageTicks({ status, size = 14 }: MessageTicksProps) {
  if (!status) return null;
  if (status === 'sending') {
    return <Feather testID="ticks-sending" name="clock" size={size - 2} color={GREY} />;
  }
  const color = status === 'read' ? READ_COLOR : GREY;
  if (status === 'sent') {
    return <Feather testID="ticks-sent" name="check" size={size} color={color} />;
  }
  return (
    <View
      testID={`ticks-${status}`}
      accessibilityLabel={status === 'read' ? 'تمت القراءة' : 'تم التسليم'}
      style={{ width: size + 6, height: size, flexDirection: 'row' }}
    >
      <Feather name="check" size={size} color={color} style={{ position: 'absolute', left: 0 }} />
      <Feather name="check" size={size} color={color} style={{ position: 'absolute', left: 6 }} />
    </View>
  );
}
