import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import { MapIcon, NotificationIcon } from '@/assets/icons/home/header/index';
import AuthGuardSheet from '@/shared/components/auth/AuthGuardSheet';
import { useAuthGuard } from '@/shared/hooks/useAuthGuard';
import { useUnreadNotificationsCount } from '@/shared/hooks/useUnreadNotificationsCount';
import { useAuthStore } from '@/shared/store/useAuthStore';

export default function HomeHeader() {
  const router = useRouter();
  const { user, activeIdentity, token } = useAuthStore();
  const { guardAction, authSheetRef } = useAuthGuard();
  const unreadCount = useUnreadNotificationsCount();

  const getActiveProfileDetails = () => {
    if (activeIdentity?.type === 'COMPANY' && activeIdentity.companyData) {
      return {
        name: activeIdentity.companyData.name,
        avatarUrl: activeIdentity.companyData.logoUrl,
      };
    }
    if (activeIdentity?.type === 'OFFICE' && activeIdentity.officeData) {
      return {
        name: activeIdentity.officeData.name,
        avatarUrl: activeIdentity.officeData.logoUrl,
      };
    }
    if (activeIdentity?.type === 'INDIVIDUAL' && activeIdentity.individualData) {
      return {
        name: activeIdentity.individualData.name || 'مستخدم',
        avatarUrl: activeIdentity.individualData.avatarUrl,
      };
    }
    return {
      name: user?.name || (user?.email ? user.email.split('@')[0] : 'مستخدم'),
      avatarUrl: user?.avatarUrl,
    };
  };

  const { name: activeName, avatarUrl: activeAvatarUrl } = getActiveProfileDetails();

  return (
    <View className="mb-2 flex-row items-center justify-between">
      {/* Right Side (RTL) - Avatar & Greeting */}
      <View className="flex-row items-center gap-2">
        <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-100">
          {token ? (
            activeAvatarUrl ? (
              <Image
                source={{ uri: activeAvatarUrl }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            ) : (
              /* User Mock Image from Figma design */
              <Image
                source={require('@/assets/mock/user-mock-image.png')}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            )
          ) : (
            <Feather name="user" size={24} color="#94A3B8" />
          )}
        </View>
        <View className="items-start">
          <Text className="font-cairo-medium text-xs text-[#6B6A6A]">
            مرحباً بك!
          </Text>
          {token && (
            <Text className="font-cairo-bold text-base text-[#111111]">
              {activeName}
            </Text>
          )}
        </View>
      </View>

      {/* Left Side (RTL) - Icons */}
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          activeOpacity={0.7}
          className="relative"
          onPress={() =>
            guardAction(() => router.push('/notification-list'))
          }
        >
          <NotificationIcon size={24} color="#111111" />
          {/* Red notification dot */}
          {token && unreadCount > 0 && (
            <View className="absolute left-0.5 top-0.5 h-2 w-2 rounded-full bg-[#BA0003]" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/map')}
          activeOpacity={0.7}
        >
          <MapIcon size={24} color="#111111" />
        </TouchableOpacity>
      </View>
      <AuthGuardSheet ref={authSheetRef} />
    </View>
  );
}
