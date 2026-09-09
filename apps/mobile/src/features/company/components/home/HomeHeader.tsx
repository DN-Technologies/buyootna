import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import {
  HomeSearchIcon,
  NotificationIcon,
} from '@/assets/icons/home/header';

interface HomeHeaderProps {
  logoUrl: string;
  displayName: string;
  isVerified?: boolean;
  unreadNotificationsCount?: number;
  onPressNotifications?: () => void;
  onPressSearch?: () => void;
}

export default function HomeHeader({
  logoUrl,
  displayName,
  isVerified = false,
  unreadNotificationsCount = 0,
  onPressNotifications,
  onPressSearch,
}: HomeHeaderProps) {
  const router = useRouter();

  const handleNotificationsPress =
    onPressNotifications || (() => router.push('/notification-list'));
  const handleSearchPress = onPressSearch || (() => router.push('/search'));

  return (
    <View className="flex-row items-center justify-between pt-4 pb-6">
      {/* Right Profile Info: Greeting, Name & Logo */}
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 overflow-hidden rounded-full border border-gray-200 bg-white">
          <Image
            source={{ uri: logoUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>
        <View>
          <Text
            className="font-cairo text-[13px] text-[#64748B]"
            style={{ writingDirection: 'rtl' }}
          >
            مرحبا بك!
          </Text>
          <View className="flex-row items-center gap-1.5">
            {isVerified && (
              <MaterialIcons name="verified" size={16} color="#3B82F6" />
            )}
            <Text className="font-cairo-semibold text-[16px] leading-[22px] text-[#111111]">
              {displayName}
            </Text>
          </View>
        </View>
      </View>

      {/* Left Actions: Search & Notifications */}
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={handleNotificationsPress}
          className="relative h-10 w-10 items-center justify-center rounded-full"
        >
          <NotificationIcon size={24} color="#111111" />
          {unreadNotificationsCount > 0 && (
            <View className="absolute left-2 top-2 h-2.5 w-2.5 rounded-full border border-white bg-[#EF4444]" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSearchPress}
          className="h-10 w-10 items-center justify-center rounded-full"
        >
          <HomeSearchIcon size={20} color="#111111" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
