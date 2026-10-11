import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { notificationsService } from '@/shared/api/notifications.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

export function useUnreadNotificationsCount() {
  const token = useAuthStore((state) => state.token);
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!token) {
        setUnreadCount(0);
        return;
      }
      notificationsService
        .getUnreadCount()
        .then(setUnreadCount)
        .catch((e) => console.error('Failed to load unread count:', e));
    }, [token]),
  );

  return unreadCount;
}
