import { Feather, FontAwesome } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { VerifiedIcon } from '@/assets/icons/home/property';
import Avatar from '@/shared/components/ui/Avatar';

export interface ListerProfileSnippetProps {
  name: string;
  joinedDate: string;
  rating: number;
  // Hides the star when the host has no reviews yet (older APIs omit it)
  reviewsCount?: number;
  avatarUrl: string;
  isVerified?: boolean;
  onPress?: () => void;
}

export default function ListerProfileSnippet({
  name,
  joinedDate,
  rating,
  reviewsCount,
  avatarUrl,
  isVerified = true,
  onPress,
}: ListerProfileSnippetProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="flex-row items-center justify-between rounded-md bg-[#F9FAFE] p-4"
    >
      {/* ---  Info & Avatar --- */}
      <View className="flex-1 flex-row items-center gap-3">
        {/* Avatar with Verification Badge */}
        <View className="relative">
          <View className="h-14 w-14 overflow-hidden rounded-full">
            <Avatar uri={avatarUrl} testID="lister-avatar" />
          </View>
          {isVerified && (
            <View className="absolute -bottom-0.5 -left-0.5 rounded-full">
              <VerifiedIcon size={18} />
            </View>
          )}
        </View>

        {/* Text Info */}
        <View className="items-start gap-0.5">
          <Text className="font-cairo-semibold text-base text-[#111111]">
            {name}
          </Text>
          <Text className="mt-1 font-cairo-medium text-xs text-[#6B6A6A]">
            مضيف في بيوتنا منذ {joinedDate}
          </Text>
        </View>
      </View>

      {/* ---  Rating & Chevron --- */}
      <View className="items-end justify-center gap-1">
        {(reviewsCount ?? 0) > 0 && (
          <View className="flex-row items-center gap-1">
            <FontAwesome name="star" size={12} color="#F59E0B" />
            <Text className="font-sans text-sm leading-[20px] text-[#111111]">
              {rating.toFixed(1)}
            </Text>
          </View>
        )}
        <Feather name="chevron-left" size={20} color="#6B6A6A" />
      </View>
    </TouchableOpacity>
  );
}
