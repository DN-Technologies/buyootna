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
  // Light text/background on a dark (my) bubble
  onDark?: boolean;
  onPress?: () => void;
}

/** The quoted message shown on top of a reply (and in the compose bar). */
const QUOTE_MIN_WIDTH = 180;

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
      // Figma 4410:168675: a white card with a navy bar on its right
      className={`flex-row overflow-hidden rounded-[4px] ${
        onDark ? 'bg-white/15' : 'bg-white'
      }`}
      // The bubble is as wide as its text: without a minimum, a short reply
      // ("كده؟") squeezed the quote to one letter per line
      style={{ minWidth: QUOTE_MIN_WIDTH }}
    >
      <View className={`w-1 ${onDark ? 'bg-white' : 'bg-[#15304D]'}`} />
      <View className="flex-1 p-2">
        <Text
          testID="reply-quote-name"
          numberOfLines={1}
          className={`font-cairo-semibold text-[12px] leading-[16px] ${
            onDark ? 'text-white' : 'text-[#15304D]'
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
            className={`flex-1 font-cairo text-[12px] leading-[15px] ${
              onDark ? 'text-white/80' : 'text-[#15304D]'
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
