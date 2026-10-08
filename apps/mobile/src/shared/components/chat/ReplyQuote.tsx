import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { ReplyPreview } from '@/shared/api/chat.service';

/** One-line summary of a quoted message. */
export function quoteText(reply: ReplyPreview): string {
  if (reply.deleted) return 'رسالة محذوفة';
  if (reply.type === 'IMAGE') return reply.content ? `📷 ${reply.content}` : '📷 صورة';
  if (reply.type === 'FILE') return reply.content ? `📎 ${reply.content}` : '📎 ملف';
  if (reply.type === 'VIDEO') return reply.content ? `🎥 ${reply.content}` : '🎥 فيديو';
  if (reply.type === 'VOICE') return '🎤 رسالة صوتية';
  if (reply.type === 'LOCATION') return '📍 موقع';
  if (reply.type === 'APPOINTMENT') return '📅 موعد معاينة';
  if (reply.type === 'OFFER') return '💰 عرض سعر';
  if (reply.type === 'PROPERTY') return '🏠 عقار';
  return reply.content ?? '';
}

interface ReplyQuoteProps {
  reply: ReplyPreview;
  // The other person's name ("أنت" when the quoted message is yours)
  otherName: string;
  // Light text/background on a dark (their) bubble
  onDark?: boolean;
  onPress?: () => void;
}

/** The quoted message shown on top of a reply (and in the compose bar). */
export default function ReplyQuote({
  reply,
  otherName,
  onDark = false,
  onPress,
}: ReplyQuoteProps) {
  const name = reply.isMine ? 'أنت' : otherName;
  return (
    <TouchableOpacity
      testID="reply-quote"
      activeOpacity={0.8}
      disabled={!onPress || reply.deleted}
      onPress={onPress}
      className={`mb-2 flex-row overflow-hidden rounded-md ${
        onDark ? 'bg-white/15' : 'bg-[#15304D]/10'
      }`}
    >
      <View className="w-1 bg-[#B28648]" />
      <View className="flex-1 px-2.5 py-1.5">
        <Text
          className={`font-cairo-semibold text-[12px] ${
            onDark ? 'text-[#F5D9A8]' : 'text-[#B28648]'
          }`}
          style={{ writingDirection: 'rtl' }}
        >
          {name}
        </Text>
        <View className="flex-row items-center gap-1">
          {reply.deleted && (
            <Feather
              name="slash"
              size={11}
              color={onDark ? '#CBD5E1' : '#94A3B8'}
            />
          )}
          <Text
            numberOfLines={2}
            className={`font-cairo text-[12px] ${
              onDark ? 'text-white/80' : 'text-[#6B6A6A]'
            }`}
            style={{ writingDirection: 'rtl' }}
          >
            {quoteText(reply)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
