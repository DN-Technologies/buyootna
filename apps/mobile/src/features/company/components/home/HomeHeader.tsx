import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { VerifiedBadgeIcon } from '@/assets/icons/activity';
import { NotificationIcon } from '@/assets/icons/home/header';

interface HomeHeaderProps {
  logoUrl: string;
  displayName: string;
  isVerified?: boolean;
  unreadNotificationsCount?: number;
  onPressNotifications?: () => void;
}

// Figma "pages title": logo and name on the right, the bell on the left
export default function HomeHeader({
  logoUrl,
  displayName,
  isVerified = false,
  unreadNotificationsCount = 0,
  onPressNotifications,
}: HomeHeaderProps) {
  const router = useRouter();

  const handleNotificationsPress =
    onPressNotifications || (() => router.push('/notification-list'));

  return (
    <View className="h-[52px] flex-row items-center gap-2 px-4 py-[6px]">
      <View className="flex-1 flex-row items-center gap-[10px]">
        <Image
          source={{ uri: logoUrl }}
          className="h-12 w-12 rounded-full bg-[#F5F7F9]"
          resizeMode="cover"
        />
        <View className="flex-1 items-start gap-[2px]">
          <Text
            className="font-cairo text-[13px] leading-[16px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            مرحبا بك!
          </Text>
          <View className="flex-row items-center gap-[5px]">
            <Text
              className="shrink font-cairo-semibold text-[16px] leading-[22px] text-[#111111]"
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {isVerified && <VerifiedBadgeIcon size={12} />}
          </View>
        </View>
      </View>

      <TouchableOpacity
        testID="company-home-notifications"
        accessibilityLabel="الإشعارات"
        activeOpacity={0.7}
        onPress={handleNotificationsPress}
        className="h-8 w-8 items-center justify-center rounded-full"
      >
        <NotificationIcon size={22} color="#111111" />
        {unreadNotificationsCount > 0 && (
          <View
            testID="company-home-notifications-dot"
            // Physical left 17px as in Figma: left/right swap under RTL
            className="absolute left-[9px] top-[8px] h-[6px] w-[6px] rounded-full bg-[#BA0003]"
          />
        )}
      </TouchableOpacity>
    </View>
  );
}
