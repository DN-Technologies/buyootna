import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import { VerifiedBadgeIcon } from '@/assets/icons/activity';
import { formatTimeAgo } from '@/shared/utils/helpers/time';

import type { StoryAuthor } from '../types';

interface StoryHeaderProps {
  author: StoryAuthor;
  publishedAt: string;
  onClose: () => void;
  onOptions: () => void;
}

export default function StoryHeader({
  author,
  publishedAt,
  onClose,
  onOptions,
}: StoryHeaderProps) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="size-9 items-center justify-center overflow-hidden rounded-full bg-[#DEE3E8]">
        {author.logoUrl ? (
          <Image
            source={{ uri: author.logoUrl }}
            contentFit="cover"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <Text className="font-cairo-bold text-[14px] text-[#15304D]">
            {author.name.trim().charAt(0)}
          </Text>
        )}
      </View>
      <View className="flex-1 flex-row items-center gap-1">
        <Text
          testID="story-author-name"
          numberOfLines={1}
          className="shrink font-cairo-semibold text-[14px] text-white"
          style={{ writingDirection: 'rtl' }}
        >
          {author.name}
        </Text>
        {author.isVerified && <VerifiedBadgeIcon size={14} />}
        <Text className="font-cairo-medium text-[12px] text-white/70">
          {formatTimeAgo(publishedAt)}
        </Text>
      </View>
      <TouchableOpacity
        testID="story-options"
        onPress={onOptions}
        accessibilityLabel="خيارات"
        className="size-9 items-center justify-center"
      >
        <Feather name="more-vertical" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      <TouchableOpacity
        testID="story-close"
        onPress={onClose}
        accessibilityLabel="إغلاق"
        className="size-9 items-center justify-center"
      >
        <Feather name="x" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
