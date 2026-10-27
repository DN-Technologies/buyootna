import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import {
  formatPresence,
  formatResponseTime,
} from '@/shared/utils/helpers/activity';

import Avatar from '@/shared/components/ui/Avatar';

import { UserProfile } from './types';

interface ProfileHeaderCardProps {
  userProfile: UserProfile;
  propertiesCount: number;
}

export default function ProfileHeaderCard({
  userProfile,
  propertiesCount,
}: ProfileHeaderCardProps) {
  const activity = formatPresence(userProfile.presence);
  const responseTime = formatResponseTime(userProfile.responseTime);

  return (
    <View className="mb-4">
      {/* Cover Image Placeholder */}
      <View className="mx-5 h-24 rounded-t-md bg-[#15304D]" />

      {/* Profile Card Overlay */}
      <View
        className="mx-5 -mt-10 rounded-b-md border border-gray-100 bg-white p-5 shadow-sm"
        style={{
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        }}
      >
        {/* Overlapping Avatar */}
        <View className="absolute -top-10 left-5 z-10 h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-sm">
          <Avatar uri={userProfile.avatarUrl} testID="profile-header-avatar" />
        </View>

        {/* Spacer */}
        <View className="h-10" />

        {/* Name, Rating & Status Badge Row */}
        <View
          style={{ flexDirection: 'row' }}
          className="mt-3 items-start justify-between"
        >
          {/* Right side: Name & Rating */}
          <View>
            <View
              style={{ flexDirection: 'row' }}
              className="items-center gap-1"
            >
              <Text className="text-right font-cairo-bold text-lg text-[#111111]">
                {userProfile.name}
              </Text>
              {userProfile.role !== 'INDIVIDUAL' && (
                <MaterialIcons name="verified" size={16} color="#018B1B" />
              )}
            </View>

            <View
              style={{ flexDirection: 'row' }}
              className="mt-0.5 items-center gap-1"
            >
              {userProfile.reviewsCount > 0 ? (
                <>
                  <FontAwesome
                    name="star"
                    size={14}
                    color="#F59E0B"
                    className="relative -top-1"
                  />
                  <Text className="font-sans text-sm text-[#111111]">
                    {userProfile.rating.toFixed(1)}
                  </Text>
                  <Text className="mr-1 font-cairo text-xs text-[#6B6A6A]">
                    ({userProfile.reviewsCount} تقييم)
                  </Text>
                </>
              ) : (
                <Text className="font-cairo text-xs text-[#6B6A6A]">
                  لا توجد تقييمات بعد
                </Text>
              )}
            </View>
          </View>

          {/* Left side: Activity badge (hidden after a week of no activity) */}
          {activity && (
            <View
              style={{ flexDirection: 'row' }}
              className="items-center gap-1 rounded-full px-3 py-1"
            >
              {activity.isOnline && (
                <View className="h-2 w-2 rounded-full bg-[#15A72B]" />
              )}
              <Text
                className={`font-cairo text-xs leading-[24px] ${
                  activity.isOnline ? 'text-[#15A72B]' : 'text-[#6B6A6A]'
                }`}
              >
                {activity.label}
              </Text>
            </View>
          )}
        </View>

        {/* Stats Bar Component */}
        <View
          style={{ flexDirection: 'row' }}
          className="mt-4 items-center justify-between rounded-xl bg-[#F8F9FC] p-4"
        >
          <View className="flex-1 items-center">
            <Text className="font-sans text-sm font-bold text-[#111111]">
              {propertiesCount}
            </Text>
            <Text className="mt-0.5 font-cairo text-[10px] text-[#6B6A6A]">
              الإعلانات
            </Text>
          </View>
          <View className="h-6 w-[1px] bg-slate-200" />
          <View className="flex-1 items-center">
            <Text className="font-sans text-sm font-bold text-[#111111]">
              {userProfile.soldCount}
            </Text>
            <Text className="mt-0.5 font-cairo text-[10px] text-[#6B6A6A]">
              العقارات المباعة
            </Text>
          </View>
          {/* Shown once there are enough answered chats to say anything */}
          {responseTime && (
            <>
              <View className="h-6 w-[1px] bg-slate-200" />
              <View className="flex-1 items-center">
                <Text className="font-cairo-bold text-[11px] text-[#111111]">
                  {responseTime}
                </Text>
                <Text className="mt-0.5 font-cairo text-[10px] text-[#6B6A6A]">
                  سرعة الرد
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}
