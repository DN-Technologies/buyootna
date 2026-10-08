import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatMessage } from '@/shared/api/chat.service';

import { quoteText } from './ReplyQuote';

interface MessageOptionsSheetProps {
  message: ChatMessage | null;
  onClose: () => void;
  onReply: (message: ChatMessage) => void;
  onCopy: (message: ChatMessage) => void;
  onHide: (message: ChatMessage) => void;
}

/** Long-press on a message: رد / نسخ / حذف لدي. */
export default function MessageOptionsSheet({
  message,
  onClose,
  onReply,
  onCopy,
  onHide,
}: MessageOptionsSheetProps) {
  const insets = useSafeAreaInsets();
  if (!message) return null;

  const run = (action: (m: ChatMessage) => void) => () => {
    onClose();
    action(message);
  };
  const canCopy = message.type === 'TEXT' && !!message.content?.trim();
  // A message still being sent has no id on the server yet
  const sent = !message.sending && !message.id.startsWith('temp-');

  const options = [
    sent && {
      key: 'reply',
      label: 'رد',
      icon: 'corner-up-left' as const,
      onPress: run(onReply),
    },
    canCopy && {
      key: 'copy',
      label: 'نسخ',
      icon: 'copy' as const,
      onPress: run(onCopy),
    },
    sent && {
      key: 'hide',
      label: 'حذف لدي',
      icon: 'trash-2' as const,
      danger: true,
      onPress: run(onHide),
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    icon: 'corner-up-left' | 'copy' | 'trash-2';
    danger?: boolean;
    onPress: () => void;
  }[];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        testID="message-options-backdrop"
        className="flex-1 justify-end bg-black/40"
        onPress={onClose}
      >
        <Pressable
          testID="message-options-sheet"
          className="rounded-t-3xl bg-white px-5 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
        >
          <View className="mb-3 h-1 w-10 self-center rounded-full bg-[#CBD5E1]" />
          <Text
            numberOfLines={2}
            className="mb-3 rounded-xl bg-[#F9FAFE] px-3 py-2 font-cairo text-[13px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            {quoteText({
              id: message.id,
              type: message.type,
              content: message.content,
            })}
          </Text>
          {options.map((o) => (
            <TouchableOpacity
              key={o.key}
              testID={`message-option-${o.key}`}
              activeOpacity={0.7}
              onPress={o.onPress}
              className="flex-row items-center gap-3 border-b border-gray-100 py-3.5"
            >
              <Feather
                name={o.icon}
                size={18}
                color={o.danger ? '#DC2626' : '#15304D'}
              />
              <Text
                className={`font-cairo-semibold text-[15px] ${
                  o.danger ? 'text-[#DC2626]' : 'text-[#111111]'
                }`}
              >
                {o.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
