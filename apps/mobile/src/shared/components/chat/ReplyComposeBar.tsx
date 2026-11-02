import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { ReplyPreview, StoryReplyPreview } from '@/shared/api/chat.service';

import { quoteText } from './ReplyQuote';
import { storyQuoteText } from './StoryReplyQuote';

/** Above the input while replying: what's being replied to, with ✕. */
export default function ReplyComposeBar({
  reply,
  story,
  otherName,
  onCancel,
}: {
  // One or the other: a message, or a story with its thumbnail
  reply?: ReplyPreview;
  story?: StoryReplyPreview;
  otherName: string;
  onCancel: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <View
      testID="reply-compose-bar"
      className="flex-row items-center border-t border-gray-100 bg-[#F9FAFE] px-4 py-2"
    >
      <View className="mr-3 w-1 self-stretch rounded-full bg-[#B28648]" />
      <View className="flex-1">
        <Text
          className="font-cairo-semibold text-[12px] text-[#B28648]"
          style={{ writingDirection: 'rtl' }}
        >
          {story
            ? `الرد على قصة ${otherName}`
            : `الرد على ${reply?.isMine ? 'نفسك' : otherName}`}
        </Text>
        <Text
          numberOfLines={1}
          className="font-cairo text-[12px] text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
        >
          {story ? storyQuoteText(story) : reply ? quoteText(reply) : ''}
        </Text>
      </View>
      {!!story?.thumbnailUrl && !imageFailed && (
        <Image
          testID="reply-compose-story-thumbnail"
          source={{ uri: story.thumbnailUrl }}
          contentFit="cover"
          onError={() => setImageFailed(true)}
          style={{ width: 36, height: 48, borderRadius: 4, marginHorizontal: 8 }}
        />
      )}
      <TouchableOpacity
        testID="reply-compose-cancel"
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="إلغاء الرد"
        className="p-1.5"
      >
        <Feather name="x" size={18} color="#6B6A6A" />
      </TouchableOpacity>
    </View>
  );
}
