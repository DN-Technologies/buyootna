import { Feather } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AppNotification,
  notificationsService,
} from '@/shared/api/notifications.service';
import GuestEmptyState from '@/shared/components/GuestEmptyState';
import ListRowSkeleton from '@/shared/components/skeletons/ListRowSkeleton';
import { useAuthStore } from '@/shared/store/useAuthStore';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('ar-EG', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const NOTIFICATIONS_QUERY_KEY = ['notifications'];

export default function NotificationListScreen() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    isRefetching: isRefreshing,
    refetch: handleRefresh,
  } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => notificationsService.list(),
    enabled: !!token,
  });

  const handlePress = async (notification: AppNotification) => {
    if (!notification.isRead) {
      queryClient.setQueryData<AppNotification[]>(
        NOTIFICATIONS_QUERY_KEY,
        (prev) =>
          prev?.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n,
          ),
      );
      try {
        await notificationsService.markAsRead(notification.id);
      } catch (e) {
        console.error('Failed to mark notification as read:', e);
      }
    }
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  const handleMarkAllRead = async () => {
    queryClient.setQueryData<AppNotification[]>(
      NOTIFICATIONS_QUERY_KEY,
      (prev) => prev?.map((n) => ({ ...n, isRead: true })),
    );
    try {
      await notificationsService.markAllAsRead();
    } catch (e) {
      console.error('Failed to mark all notifications as read:', e);
    }
  };

  if (!token) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-4">
          <TouchableOpacity onPress={() => router.back()} className="w-8">
            <Feather name="chevron-right" size={24} color="#111111" />
          </TouchableOpacity>
          <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
            الإشعارات
          </Text>
          <View className="w-8" />
        </View>
        <GuestEmptyState
          icon="bell"
          title="ابق على اطلاع دائم"
          description="سجل حسابك لاستقبال إشعارات العقارات الجديدة والرسائل والتنبيهات المهمة."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-4">
        <TouchableOpacity onPress={() => router.back()} className="w-8">
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
          الإشعارات
        </Text>
        <TouchableOpacity
          onPress={handleMarkAllRead}
          disabled={!hasUnread}
          className="w-8"
        >
          {hasUnread && (
            <Feather name="check-circle" size={20} color="#15304D" />
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="px-5 pt-4">
          {[1, 2, 3, 4].map((key) => (
            <ListRowSkeleton key={key} showIcon={false} />
          ))}
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-[#15304D]/5">
            <Feather name="bell" size={32} color="#15304D" />
          </View>
          <Text className="mb-2 text-center font-cairo-bold text-lg text-[#111111]">
            لا توجد إشعارات بعد
          </Text>
          <Text className="text-center font-cairo-medium text-sm text-[#6B6A6A]">
            ستظهر هنا التنبيهات المهمة الخاصة بحسابك.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingVertical: 8 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        >
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              activeOpacity={0.7}
              onPress={() => handlePress(notification)}
              className={`flex-row gap-3 border-b border-gray-50 px-5 py-4 ${
                notification.isRead ? 'bg-white' : 'bg-[#15304D]/[0.03]'
              }`}
            >
              {!notification.isRead && (
                <View className="mt-2 h-2 w-2 rounded-full bg-[#BA0003]" />
              )}
              <View className="flex-1">
                <Text className="mb-1 font-cairo-bold text-[14px] text-[#111111]">
                  {notification.title}
                </Text>
                <Text className="mb-2 font-cairo-medium text-[13px] leading-5 text-[#6B6A6A]">
                  {notification.body}
                </Text>
                <Text className="font-cairo-medium text-[11px] text-[#9CA3AF]">
                  {formatDate(notification.createdAt)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
