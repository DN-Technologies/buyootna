import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import NotificationCard from '@/features/individual/components/notifications/NotificationCard';
import NotificationDeleteToast from '@/features/individual/components/notifications/NotificationDeleteToast';
import NotificationOptionsMenu from '@/features/individual/components/notifications/NotificationOptionsMenu';
import NotificationsEmptyState from '@/features/individual/components/notifications/NotificationsEmptyState';
import NotificationTabs from '@/features/individual/components/notifications/NotificationTabs';
import { useNotificationList } from '@/features/individual/hooks/useNotificationList';
import { getNotificationRoute } from '@/features/individual/utils/notificationRoute';
import { AppNotification } from '@/shared/api/notifications.service';
import GuestEmptyState from '@/shared/components/GuestEmptyState';
import ListRowSkeleton from '@/shared/components/skeletons/ListRowSkeleton';
import { useAuthStore } from '@/shared/store/useAuthStore';

export default function NotificationListScreen() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  const {
    notifications,
    filteredNotifications,
    isLoading,
    isRefreshing,
    handleRefresh,
    activeTab,
    setActiveTab,
    hasUnread,
    isMenuVisible,
    selectedNotification,
    menuAnchorY,
    handleOpenMenu,
    handleCloseMenu,
    handleMarkAsRead,
    handleToggleRead,
    handleMarkAllRead,
    isToastVisible,
    handleDeleteNotification,
    handleUndoDelete,
    handleDismissToast,
  } = useNotificationList();

  // Tapping marks it read and opens what it points at (e.g. the matched listing)
  const handleOpenNotification = (notification: AppNotification) => {
    handleMarkAsRead(notification);
    const route = getNotificationRoute(notification);
    if (route) router.push(route as any);
  };

  if (!token) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8"
            accessibilityLabel="رجوع"
          >
            <Feather name="chevron-right" size={24} color="#111111" />
          </TouchableOpacity>
          <Text
            className="font-cairo-semibold text-lg leading-[24px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
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
    <SafeAreaView className="relative flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Header bar */}
      <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-8"
          accessibilityLabel="رجوع"
        >
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        <Text
          className="font-cairo-semibold text-[18px] leading-[24px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          الإشعارات
        </Text>
        <View className="w-8" />
      </View>

      {/* Tabs Row */}
      <NotificationTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasUnread={hasUnread}
        onMarkAllRead={handleMarkAllRead}
      />

      {/* Body content */}
      {isLoading ? (
        <View className="px-5 pt-4">
          {[1, 2, 3, 4].map((key) => (
            <ListRowSkeleton key={key} showIcon={false} />
          ))}
        </View>
      ) : notifications.length === 0 ? (
        <NotificationsEmptyState onExplore={() => router.push('/')} />
      ) : filteredNotifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text
            className="font-cairo-semibold text-[14px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            لا توجد إشعارات غير مقروءة حالياً
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        >
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onPress={handleOpenNotification}
              onMenuPress={handleOpenMenu}
            />
          ))}
        </ScrollView>
      )}

      {/* Options Menu Dropdown */}
      <NotificationOptionsMenu
        visible={isMenuVisible}
        notification={selectedNotification}
        anchorY={menuAnchorY}
        onClose={handleCloseMenu}
        onMarkAsRead={handleToggleRead}
        onDelete={handleDeleteNotification}
      />

      {/* Delete Undo Toast */}
      <NotificationDeleteToast
        visible={isToastVisible}
        onUndo={handleUndoDelete}
        onDismiss={handleDismissToast}
      />
    </SafeAreaView>
  );
}
