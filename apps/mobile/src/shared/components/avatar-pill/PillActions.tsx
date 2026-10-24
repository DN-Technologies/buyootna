import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { ViewStyle } from 'react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { useAuthStore } from '@/shared/store/useAuthStore';

import ChatIcon from './ChatIcon';
import { ACTIONS_WIDTH, GOLD } from './constants';

interface PillActionsProps {
  open: boolean;
  // The slot's width and fade, driven by the pill's spring
  slotStyle: AnimatedStyle<ViewStyle>;
  chatsUnread: boolean;
  notificationsUnread: boolean;
}

/**
 * The open pill's icons: chats and the bell, each with a red dot while it
 * has unread items. The slot clips the row while it grows, so the chat
 * (nearest the photo) shows first, then the bell.
 */
export default function PillActions({
  open,
  slotStyle,
  chatsUnread,
  notificationsUnread,
}: PillActionsProps) {
  const router = useRouter();
  // Each profile type has its own chats list
  const identity = useAuthStore((s) => s.activeIdentity?.type);
  const chatsHref =
    identity === 'COMPANY'
      ? '/(company)/company-chats'
      : identity === 'OFFICE'
        ? '/(office)/office-chats'
        : '/chat';

  return (
    <Animated.View
      testID="avatar-pill-actions"
      pointerEvents={open ? 'auto' : 'none'}
      accessibilityElementsHidden={!open}
      importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
      className="h-[34px] items-start overflow-hidden"
      style={slotStyle}
    >
      <View className="flex-row items-center" style={{ gap: 8, width: ACTIONS_WIDTH }}>
        <TouchableOpacity
          testID="avatar-pill-chats"
          accessibilityRole="button"
          accessibilityLabel="المحادثات"
          onPress={() => router.push(chatsHref)}
        >
          <ChatIcon dot={chatsUnread} />
        </TouchableOpacity>
        {/* Figma's divider (a 0.3pt gold line, 24 tall): drawn as a
            hairline, since the 0.3pt-high SVG turned upright rendered
            nothing */}
        <View
          style={{
            width: StyleSheet.hairlineWidth,
            height: 24.042,
            backgroundColor: GOLD,
          }}
        />
        <TouchableOpacity
          testID="avatar-pill-notifications"
          accessibilityRole="button"
          accessibilityLabel="الإشعارات"
          onPress={() => router.push('/notification-list')}
          className="size-[34px] items-center justify-center"
        >
          <Image
            source={require('@/assets/icons/home/topbar/bell.svg')}
            style={{ width: 14.858, height: 15.575 }}
            contentFit="contain"
          />
          {notificationsUnread && (
            <Image
              testID="avatar-pill-notifications-dot"
              source={require('@/assets/icons/home/topbar/red-dot.svg')}
              // The app's RTL swaps left and right: this is Figma's left 19.88
              style={{
                position: 'absolute',
                right: 19.88,
                top: 11,
                width: 6,
                height: 6,
              }}
              contentFit="contain"
            />
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
