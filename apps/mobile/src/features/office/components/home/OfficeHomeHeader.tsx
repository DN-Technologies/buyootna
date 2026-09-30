import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { NotificationIcon } from '@/assets/icons/home/header';

interface OfficeHomeHeaderProps {
  logoUrl?: string;
  displayName: string;
  isVerified?: boolean;
  unreadNotificationsCount?: number;
  onPressNotifications?: () => void;
}

export default function OfficeHomeHeader({
  logoUrl,
  displayName,
  isVerified = true,
  unreadNotificationsCount = 0,
  onPressNotifications,
}: OfficeHomeHeaderProps) {
  const router = useRouter();

  const handleNotificationsPress =
    onPressNotifications || (() => router.push('/notification-list'));

  return (
    <View className="flex-row items-center justify-between pb-4 pt-2">
      {/* Right: Greeting, Office Name with Verified Badge, and Avatar */}
      <View className="flex-row items-center gap-3">
        {/* Circular Avatar */}
        <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#ECECEC] bg-[#15304D]">
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="font-cairo-bold text-lg text-white">
              {displayName.slice(0, 1)}
            </Text>
          )}
        </View>

        <View className="">
          <Text
            className="font-cairo text-[13px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            مرحبا بك!
          </Text>
          <View className="flex-row items-center gap-1">
            {isVerified && (
              <MaterialIcons name="verified" size={16} color="#0284C7" />
            )}
            <Text
              className="font-cairo-semibold text-[16px] leading-[22px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              {displayName}
            </Text>
          </View>
        </View>
      </View>


      {/* Left: Notifications Bell */}
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={handleNotificationsPress}
          className="relative h-10 w-10 items-center justify-center rounded-full"
          accessibilityLabel="الإشعارات"
          accessibilityRole="button"
        >
          <NotificationIcon size={22} color="#111111" />
          {unreadNotificationsCount > 0 && (
            <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#9C1E28]" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
