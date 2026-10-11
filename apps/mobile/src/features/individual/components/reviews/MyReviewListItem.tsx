import { Feather, FontAwesome } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import type { ReviewItem } from '@/shared/components/profile/types';
import Avatar from '@/shared/components/ui/Avatar';

interface MyReviewListItemProps {
  item: ReviewItem;
  onToggleLike: (id: string) => void;
  onToggleDislike: (id: string) => void;
}

/** One review of the user: reviewer, stars, comment and the like / dislike row. */
export default function MyReviewListItem({
  item,
  onToggleLike,
  onToggleDislike,
}: MyReviewListItemProps) {
  return (
    <View className="mb-4 border-b border-gray-100 pb-4">
      {/* Top user row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-[48px] w-[48px] overflow-hidden rounded-full border border-gray-100">
            <Avatar uri={item.avatarUrl} testID={`review-avatar-${item.id}`} />
          </View>

          <View>
            <View className="mt-0.5 flex-row items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesome
                  key={star}
                  name="star"
                  size={12}
                  color={star <= item.rating ? '#FFB400' : '#E2E8F0'}
                />
              ))}
            </View>
            <Text className="font-cairo-semibold text-[14px] text-[#111111]">
              {item.userName}
            </Text>
          </View>
        </View>
        <Text className="font-cairo text-xs text-[#6B6A6A]">{item.timeAgo}</Text>
      </View>

      {/* Comment text (a stars-only review has none) */}
      {!!item.comment && (
        <Text
          className="mt-3 font-cairo text-[14px] leading-6 text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
        >
          {item.comment}
        </Text>
      )}

      {/* Optional reaction buttons */}
      {(item.likes !== undefined || item.dislikes !== undefined) && (
        <View className="mt-3 flex-row items-center gap-5 border-t border-slate-50 pt-2.5">
          <TouchableOpacity
            testID={`review-like-${item.id}`}
            activeOpacity={0.7}
            onPress={() => onToggleLike(item.id)}
            className="flex-row items-center gap-1.5"
          >
            <Feather
              name="thumbs-up"
              size={16}
              color={item.userLiked ? '#15304D' : '#94A3B8'}
            />
            <Text
              className={`font-sans text-xs ${
                item.userLiked ? 'font-bold text-[#15304D]' : 'text-[#94A3B8]'
              }`}
            >
              ({item.likes ?? 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID={`review-dislike-${item.id}`}
            activeOpacity={0.7}
            onPress={() => onToggleDislike(item.id)}
            className="flex-row items-center gap-1.5"
          >
            <Feather
              name="thumbs-down"
              size={16}
              color={item.userDisliked ? '#EF4444' : '#94A3B8'}
            />
            <Text
              className={`font-sans text-xs ${
                item.userDisliked
                  ? 'font-bold text-[#EF4444]'
                  : 'text-[#94A3B8]'
              }`}
            >
              ({item.dislikes ?? 0})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
