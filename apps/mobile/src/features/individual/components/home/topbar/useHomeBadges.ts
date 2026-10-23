import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { notificationsService } from '@/shared/api/notifications.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

export interface HomeBadges {
  notifications: number;
  chats: number;
}

const NONE: HomeBadges = { notifications: 0, chats: 0 };

/**
 * What's unread for the avatar pill: notifications, and chat messages (the
 * app-icon badge is both, for the active profile). Reloaded on focus.
 */
export function useHomeBadges(): HomeBadges {
  const token = useAuthStore((s) => s.token);
  const identityId = useAuthStore((s) => s.activeIdentity?.id);
  const [badges, setBadges] = useState<HomeBadges>(NONE);

  useFocusEffect(
    useCallback(() => {
      // Signed out, or no profile yet: nothing to count. A profile switch
      // reloads them (the counts are per profile)
      if (!token || !identityId) {
        setBadges(NONE);
        return;
      }
      let live = true;
      Promise.all([
        notificationsService.getBadge(),
        notificationsService.getUnreadCount(),
      ])
        .then(([total, notifications]) => {
          if (live) {
            setBadges({
              notifications,
              chats: Math.max(0, total - notifications),
            });
          }
        })
        .catch((e) => console.warn('Failed to load the home badges:', e));
      return () => {
        live = false;
      };
    }, [token, identityId]),
  );

  return badges;
}
