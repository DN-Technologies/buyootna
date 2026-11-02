import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { providerStoriesHref } from '@/features/stories/hooks/useProviderStoryRing';
import { StoryReplyPreview } from '@/shared/api/chat.service';

/** One-line summary of a quoted story. */
export function storyQuoteText(story: StoryReplyPreview): string {
  if (story.unavailable) return 'قصة لم تعد متاحة';
  return story.mediaType === 'VIDEO' ? '🎥 فيديو' : '📷 صورة';
}

interface StoryReplyQuoteProps {
  story: StoryReplyPreview;
  // I wrote this reply, so it's the other person's story; otherwise mine
  isMine: boolean;
  otherName: string;
  // Light text/background on a dark (my) bubble
  onDark?: boolean;
}

const QUOTE_MIN_WIDTH = 180;

/**
 * The story on top of a reply, with its thumbnail (WhatsApp's status reply).
 * Tapping opens the author's stories while this one is live. Thumbnail links
 * are short-lived: one that fails to load leaves the text line alone.
 */
export default function StoryReplyQuote({
  story,
  isMine,
  otherName,
  onDark = false,
}: StoryReplyQuoteProps) {
  const router = useRouter();
  const [imageFailed, setImageFailed] = useState(false);
  const { authorIdentityId } = story;
  const canOpen = story.isLive && !story.unavailable && !!authorIdentityId;
  const showImage = !!story.thumbnailUrl && !story.unavailable && !imageFailed;

  return (
    <TouchableOpacity
      testID="story-reply-quote"
      activeOpacity={0.8}
      disabled={!canOpen}
      onPress={() =>
        authorIdentityId && router.push(providerStoriesHref(authorIdentityId))
      }
      accessibilityRole={canOpen ? 'button' : undefined}
      className={`flex-row overflow-hidden rounded-[4px] ${
        onDark ? 'bg-white/15' : 'bg-white'
      }`}
      style={{ minWidth: QUOTE_MIN_WIDTH }}
    >
      <View className={`w-1 ${onDark ? 'bg-white' : 'bg-[#15304D]'}`} />
      <View className="flex-1 justify-center p-2">
        <Text
          testID="story-reply-quote-name"
          numberOfLines={1}
          className={`font-cairo-semibold text-[12px] leading-[16px] ${
            onDark ? 'text-white' : 'text-[#15304D]'
          }`}
          style={{ writingDirection: 'rtl' }}
        >
          {isMine ? `قصة ${otherName}` : 'قصتك'}
        </Text>
        <Text
          numberOfLines={1}
          className={`font-cairo text-[12px] leading-[15px] ${
            onDark ? 'text-white/80' : 'text-[#15304D]'
          }`}
          style={{ writingDirection: 'rtl' }}
        >
          {storyQuoteText(story)}
        </Text>
      </View>
      {showImage && (
        <Image
          testID="story-reply-quote-thumbnail"
          source={{ uri: story.thumbnailUrl as string }}
          contentFit="cover"
          onError={() => setImageFailed(true)}
          style={{ width: 40, height: 52 }}
        />
      )}
    </TouchableOpacity>
  );
}
