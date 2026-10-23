import { Text, TouchableOpacity, View } from 'react-native';

import { formatTimeAgo } from '@/shared/utils/helpers/time';

import { isPartlyWatched } from '../storyRingState';
import type { FeedAuthor } from '../types';
import StoryRing from './StoryRing';

interface StoryListRowProps {
  item: FeedAuthor;
  onPress: () => void;
}

/**
 * One provider in «القصص» (Figma 9377:35308): its ring, name and specialty
 * on the right, how long ago it posted on the left.
 */
export default function StoryListRow({ item, onPress }: StoryListRowProps) {
  const { author } = item;
  const testID = `story-row-${author.identityId}`;
  return (
    <View className="flex-row items-center" style={{ gap: 8 }}>
      <TouchableOpacity
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`قصص ${author.name}`}
        activeOpacity={0.8}
        onPress={onPress}
        className="flex-1 flex-row items-center"
        style={{ gap: 8 }}
      >
        <StoryRing
          testID={`${testID}-ring`}
          author={author}
          hasUnseen={item.hasUnseen}
          partial={isPartlyWatched(item)}
          variant="list"
          size={60}
          onPress={onPress}
        />
        <View className="flex-1 items-start">
          <Text
            numberOfLines={1}
            className="font-cairo-semibold text-[15px] leading-[24px] text-[#111111]"
          >
            {author.name}
          </Text>
          {!!author.subtitle && (
            <Text
              numberOfLines={1}
              className="font-cairo text-[13px] leading-[20px] text-[#6B6A6A]"
            >
              {author.subtitle}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      <Text className="font-cairo text-[13px] leading-[20px] text-[#6B6A6A]">
        {formatTimeAgo(item.latestPublishedAt)}
      </Text>
    </View>
  );
}
