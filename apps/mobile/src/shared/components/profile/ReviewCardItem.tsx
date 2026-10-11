import { Feather, FontAwesome } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import Avatar from '@/shared/components/ui/Avatar';

import { ReviewItem } from './types';

interface ReviewCardItemProps {
  item: ReviewItem;
  onToggleLike: (id: string) => void;
  onToggleDislike: (id: string) => void;
}

export default function ReviewCardItem({
  item,
  onToggleLike,
  onToggleDislike,
}: ReviewCardItemProps) {
  return (
    <View className="mx-5 mb-4 border-b border-[#D7D7D7] p-4">
      {/* Top user row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-[48px] w-[48px] overflow-hidden rounded-full">
            <Avatar uri={item.avatarUrl} testID={`review-avatar-${item.id}`} />
          </View>
          <View>
            <Text className="text-right font-cairo-semibold text-[14px] text-[#111111]">
              {item.userName}
            </Text>
            <View className="mt-0.5 flex-row items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesome
                  key={star}
                  name="star"
                  size={12}
                  color={star <= item.rating ? '#F59E0B' : '#E2E8F0'}
                />
              ))}
            </View>
          </View>
        </View>
        <Text className="font-cairo text-xs text-[#6B6A6A]">
          {item.timeAgo}
        </Text>
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

      {/* Helpful / Reaction row */}
      <View className="mt-4 flex-row items-center gap-5 border-t border-slate-50 pt-3">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onToggleLike(item.id)}
          className="flex-row items-center gap-1.5"
        >
          <Feather
            name="thumbs-up"
            size={18}
            color={item.userLiked ? '#15304D' : '#94A3B8'}
          />
          <Text
            className={`font-sans text-xs ${
              item.userLiked ? 'font-bold text-[#15304D]' : 'text-[#94A3B8]'
            }`}
          >
            ({item.likes})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onToggleDislike(item.id)}
          className="flex-row items-center gap-1.5"
        >
          <Feather
            name="thumbs-down"
            size={18}
            color={item.userDisliked ? '#EF4444' : '#94A3B8'}
          />
          <Text
            className={`font-sans text-xs ${
              item.userDisliked ? 'font-bold text-[#EF4444]' : 'text-[#94A3B8]'
            }`}
          >
            ({item.dislikes})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
