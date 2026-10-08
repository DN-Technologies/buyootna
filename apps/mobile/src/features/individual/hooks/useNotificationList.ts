import { useFocusEffect } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { GestureResponderEvent } from 'react-native';

import {
  AppNotification,
  notificationsService,
} from '@/shared/api/notifications.service';
import { scheduleAppBadgeSync } from '@/shared/hooks/useAppBadge';
import { useAuthStore } from '@/shared/store/useAuthStore';

import { NotificationTabKey } from '../components/notifications/NotificationTabs';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];

export function useNotificationList() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<NotificationTabKey>('ALL');

  // Options Menu state
  const [selectedNotification, setSelectedNotification] =
    useState<AppNotification | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [menuAnchorY, setMenuAnchorY] = useState(180);

  // Undo Toast & Pending Deletion state
  const [pendingDeleteNotif, setPendingDeleteNotif] =
    useState<AppNotification | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // A notification created while the app was elsewhere (e.g. an alert match)
  // must show when the screen opens, not after the 30s cache expires.
  useFocusEffect(
    useCallback(() => {
      if (token) handleRefresh();
    }, [token, handleRefresh]),
  );

  // Filtered notifications based on active tab
  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'UNREAD') {
      return !notif.isRead;
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const hasUnread = unreadCount > 0;

  // Options Menu Handlers
  const handleOpenMenu = useCallback(
    (notification: AppNotification, event: GestureResponderEvent) => {
      setSelectedNotification(notification);
      const pageY = event.nativeEvent.pageY || 180;
      setMenuAnchorY(pageY);
      setIsMenuVisible(true);
    },
    [],
  );

  const handleCloseMenu = useCallback(() => {
    setIsMenuVisible(false);
    setSelectedNotification(null);
  }, []);

  // Mark single as read
  const handleMarkAsRead = useCallback(
    async (notification: AppNotification) => {
      if (notification.isRead) return;

      queryClient.setQueryData<AppNotification[]>(
        NOTIFICATIONS_QUERY_KEY,
        (prev) =>
          prev?.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n,
          ) || [],
      );

      try {
        await notificationsService.markAsRead(notification.id);
        scheduleAppBadgeSync();
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    },
    [queryClient],
  );

  // Menu action: flip read/unread (optimistic, reverted if the call fails)
  const handleToggleRead = useCallback(
    async (notification: AppNotification) => {
      const nextIsRead = !notification.isRead;
      const setIsRead = (isRead: boolean) =>
        queryClient.setQueryData<AppNotification[]>(
          NOTIFICATIONS_QUERY_KEY,
          (prev) =>
            prev?.map((n) =>
              n.id === notification.id ? { ...n, isRead } : n,
            ) || [],
        );

      setIsRead(nextIsRead);
      try {
        if (nextIsRead) {
          await notificationsService.markAsRead(notification.id);
          scheduleAppBadgeSync();
        } else {
          await notificationsService.markAsUnread(notification.id);
        }
      } catch (err) {
        console.error('Failed to update notification read state:', err);
        setIsRead(notification.isRead);
      }
    },
    [queryClient],
  );

  // Mark all as read
  const handleMarkAllRead = useCallback(async () => {
    if (!hasUnread) return;

    queryClient.setQueryData<AppNotification[]>(
      NOTIFICATIONS_QUERY_KEY,
      (prev) => prev?.map((n) => ({ ...n, isRead: true })) || [],
    );

    try {
      await notificationsService.markAllAsRead();
      scheduleAppBadgeSync();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [hasUnread, queryClient]);

  // Execute actual API deletion
  const commitDeletion = useCallback(async (id: string) => {
    try {
      await notificationsService.remove(id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, []);

  // Delete notification (optimistic with undo)
  const handleDeleteNotification = useCallback(
    (notification: AppNotification) => {
      // If there's an existing pending delete, commit it first
      if (pendingDeleteNotif && deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
        commitDeletion(pendingDeleteNotif.id);
      }

      setPendingDeleteNotif(notification);
      setIsToastVisible(true);

      // Optimistically remove from list
      queryClient.setQueryData<AppNotification[]>(
        NOTIFICATIONS_QUERY_KEY,
        (prev) => prev?.filter((n) => n.id !== notification.id) || [],
      );

      // Set timeout to commit after 4 seconds
      deleteTimerRef.current = setTimeout(() => {
        commitDeletion(notification.id);
        setPendingDeleteNotif(null);
        setIsToastVisible(false);
        deleteTimerRef.current = null;
      }, 4000);
    },
    [commitDeletion, pendingDeleteNotif, queryClient],
  );

  // Undo deletion
  const handleUndoDelete = useCallback(() => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }

    if (pendingDeleteNotif) {
      // Restore notification back into list
      queryClient.setQueryData<AppNotification[]>(
        NOTIFICATIONS_QUERY_KEY,
        (prev) => (prev ? [pendingDeleteNotif, ...prev] : [pendingDeleteNotif]),
      );
      setPendingDeleteNotif(null);
    }

    setIsToastVisible(false);
  }, [pendingDeleteNotif, queryClient]);

  // Toast auto-dismissed without undo
  const handleDismissToast = useCallback(() => {
    if (pendingDeleteNotif) {
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
        deleteTimerRef.current = null;
      }
      commitDeletion(pendingDeleteNotif.id);
      setPendingDeleteNotif(null);
    }
    setIsToastVisible(false);
  }, [commitDeletion, pendingDeleteNotif]);

  return {
    notifications,
    filteredNotifications,
    isLoading,
    isRefreshing,
    handleRefresh,
    activeTab,
    setActiveTab,
    hasUnread,
    unreadCount,
    // Options menu
    isMenuVisible,
    selectedNotification,
    menuAnchorY,
    handleOpenMenu,
    handleCloseMenu,
    handleMarkAsRead,
    handleToggleRead,
    handleMarkAllRead,
    // Deletion & Toast
    isToastVisible,
    handleDeleteNotification,
    handleUndoDelete,
    handleDismissToast,
  };
}
