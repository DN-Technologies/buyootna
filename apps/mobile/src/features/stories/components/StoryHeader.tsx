import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { VerifiedBadgeIcon } from '@/assets/icons/activity';
import { formatTimeAgo } from '@/shared/utils/helpers/time';

import type { StoryAuthor } from '../types';
import { moreXml } from './composer/storyIconXml';

interface StoryHeaderProps {
  author: StoryAuthor;
  publishedAt: string;
  onClose: () => void;
  onOptions: () => void;
  // The author's own stories: «حالتي», and + to post another
  own?: { onAdd: () => void };
}

/**
 * The viewer's header (Figma 9519:30138): › to close, the avatar, the name
 * over how long ago, and ⋮ at the far side.
 */
export default function StoryHeader({
  author,
  publishedAt,
  onClose,
  onOptions,
  own,
}: StoryHeaderProps) {
  const avatar = (
    <View className="size-[44px] items-center justify-center overflow-hidden rounded-full bg-[#DEE3E8]">
      {author.logoUrl ? (
        <Image
          source={{ uri: author.logoUrl }}
          contentFit="cover"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <Text className="font-cairo-bold text-[16px] text-[#15304D]">
          {author.name.trim().charAt(0)}
        </Text>
      )}
    </View>
  );

  return (
    <View className="flex-row items-center" style={{ gap: 4 }}>
      <TouchableOpacity
        testID="story-close"
        onPress={onClose}
        accessibilityLabel="إغلاق"
        className="size-[32px] items-center justify-center"
      >
        <Image
          source={require('@/assets/icons/stories/chevron.svg')}
          // Figma turns it to point back the way the text reads
          style={{ width: 20, height: 20, transform: [{ scaleX: -1 }] }}
          contentFit="contain"
        />
      </TouchableOpacity>

      <View className="flex-1 flex-row items-center" style={{ gap: 8 }}>
        {own ? (
          <TouchableOpacity
            testID="story-add-mine"
            onPress={own.onAdd}
            accessibilityLabel="أضف قصة"
          >
            {avatar}
            <View
              className="absolute size-[14px] items-center justify-center rounded-full bg-[#15304D]"
              // The app's RTL swaps left and right: Figma's left 27.78
              style={{ right: 27.78, top: 31 }}
            >
              <Image
                source={require('@/assets/icons/stories/plus.svg')}
                style={{ width: 11.2, height: 11.2 }}
                contentFit="contain"
              />
            </View>
          </TouchableOpacity>
        ) : (
          avatar
        )}
        <View className="shrink items-start">
          <View className="flex-row items-center" style={{ gap: 4 }}>
            <Text
              testID="story-author-name"
              numberOfLines={1}
              className="shrink font-cairo-semibold text-[16px] leading-[24px] text-white"
              style={{ writingDirection: 'rtl' }}
            >
              {own ? 'حالتي' : author.name}
            </Text>
            {!own && author.isVerified && <VerifiedBadgeIcon size={14} />}
          </View>
          <Text className="font-cairo text-[13px] leading-[20px] text-[#E3E3E3]">
            {formatTimeAgo(publishedAt)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        testID="story-options"
        onPress={onOptions}
        accessibilityLabel="خيارات"
        className="size-[32px] items-center justify-center"
      >
        <SvgXml xml={moreXml} width={24} height={24} />
      </TouchableOpacity>
    </View>
  );
}
