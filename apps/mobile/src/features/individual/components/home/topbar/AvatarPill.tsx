import { Feather } from '@expo/vector-icons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { type RefObject,useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { IOS_SPRING } from '@/shared/components/ui/SlidingSegment';
import { useIdentity } from '@/shared/hooks/auth/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';

import { useHomeBadges } from './useHomeBadges';

const GOLD = '#C5A36D';

// The icons' row: chat 34 + 8 + divider + 8 + bell 34
const ACTIONS_WIDTH = 84.5;
// Closed, the icons' slot keeps Figma's 96pt pill: 4 + 42 + 8 + 10 + 8 + 20 + 4
const CLOSED_SLOT = 10;

// Figma 9297:76318: the chat icon's own path, in the brand colour, with its
// red dot only while chats are unread
const CHAT_PATH =
  'M23.6602 10.75H10.3399C10.0187 10.75 9.7107 10.8817 9.4836 11.1161C9.25651 11.3505 9.12893 11.6685 9.12893 12V24.5C9.12753 24.7384 9.19286 24.9721 9.31705 25.173C9.44124 25.374 9.61901 25.5336 9.829 25.6328C9.98902 25.7097 10.1634 25.7497 10.3399 25.75C10.6241 25.7493 10.899 25.6447 11.1156 25.4547L11.1224 25.4492L13.5943 23.25H23.6602C23.9813 23.25 24.2893 23.1183 24.5164 22.8839C24.7435 22.6495 24.8711 22.3315 24.8711 22V12C24.8711 11.6685 24.7435 11.3505 24.5164 11.1161C24.2893 10.8817 23.9813 10.75 23.6602 10.75ZM23.6602 22H13.3672C13.2218 22.0001 13.0813 22.0542 12.9714 22.1523L10.3399 24.5V12H23.6602V22Z';

function ChatIcon({ dot }: { dot: boolean }) {
  return (
    <Svg width={34} height={34} viewBox="0 0 34 34" fill="none">
      <Path d={CHAT_PATH} fill="#15304D" />
      {dot && <Circle cx={23.6875} cy={21.25} r={3} fill="#BA0003" />}
    </Svg>
  );
}

interface AvatarPillProps {
  // Signed out: asks to sign in instead of opening
  authSheetRef: RefObject<BottomSheetModal | null>;
}

/**
 * The home's avatar pill (Figma 9305:76786 closed, 9297:76305 open): the
 * profile photo with what's unread. A tap or a sideways swipe opens it to
 * the chats and notifications icons; › closes it.
 */
export default function AvatarPill({ authSheetRef }: AvatarPillProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { avatarUrl } = useIdentity();
  const { notifications, chats } = useHomeBadges();
  const [open, setOpen] = useState(false);
  const progress = useSharedValue(0);
  const slot = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [CLOSED_SLOT, ACTIONS_WIDTH]),
    opacity: interpolate(progress.value, [0, 0.35, 1], [0, 0, 1]),
  }));
  const chevron = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg` },
    ],
  }));
  const count = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.3], [1, 0], 'clamp'),
  }));
  const total = notifications + chats;

  const toggle = (next: boolean) => {
    if (!token) {
      authSheetRef.current?.present();
      return;
    }
    setOpen(next);
    // One spring drives it all: the slot grows from beside the photo (which
    // never moves), the icons fade in, the count fades out, ‹ turns to ›
    progress.value = withSpring(next ? 1 : 0, IOS_SPRING);
  };

  // RTL: the pill grows to the left, so a swipe left opens it
  const swipe = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onEnd((e) => {
      if (Math.abs(e.translationX) < 24) return;
      runOnJS(toggle)(e.translationX < 0);
    });

  const photo = (
    <View className="size-[42px] items-center justify-center overflow-hidden rounded-full bg-[#F1F5F9]">
      {token && avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
      ) : (
        <Feather name="user" size={22} color="#94A3B8" />
      )}
    </View>
  );

  return (
    <GestureDetector gesture={swipe}>
      <View
        testID="avatar-pill"
        className="h-[46px] flex-row items-center rounded-full p-[4px]"
        style={{
          borderWidth: 0.5,
          borderColor: GOLD,
          gap: 8,
        }}
      >
        <TouchableOpacity
          testID="avatar-pill-photo"
          accessibilityRole="button"
          accessibilityLabel={open ? 'إغلاق' : 'الإشعارات والمحادثات'}
          activeOpacity={0.8}
          onPress={() => toggle(!open)}
        >
          {photo}
        </TouchableOpacity>

        {/* The icons' slot: clips the row while it grows, so the chat
            (nearest the photo) shows first, then the bell */}
        <Animated.View
          testID="avatar-pill-actions"
          pointerEvents={open ? 'auto' : 'none'}
          accessibilityElementsHidden={!open}
          importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
          className="h-[34px] items-start overflow-hidden"
          style={slot}
        >
          <View
            className="flex-row items-center"
            style={{ gap: 8, width: ACTIONS_WIDTH }}
          >
            <TouchableOpacity
              testID="avatar-pill-chats"
              accessibilityRole="button"
              accessibilityLabel="المحادثات"
              onPress={() => router.push('/chat')}
            >
              <ChatIcon dot={chats > 0} />
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
              {notifications > 0 && (
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

        <TouchableOpacity
          testID="avatar-pill-toggle"
          accessibilityRole="button"
          accessibilityLabel={open ? 'إغلاق' : 'فتح'}
          hitSlop={10}
          onPress={() => toggle(!open)}
          className="size-[20px] items-center justify-center"
        >
          {/* Closed it points away from the photo (‹), open back at it (›) */}
          <Animated.View style={chevron}>
            <Image
              source={require('@/assets/icons/home/topbar/chevron.svg')}
              style={{ width: 14, height: 14 }}
              contentFit="contain"
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Figma's count sits over the photo's edge, beside the chevron */}
        {total > 0 && (
          <Animated.View
            testID="avatar-pill-count"
            pointerEvents="none"
            className="absolute size-[14px] items-center justify-center rounded-full bg-[#BA0003]"
            // The app's RTL swaps left and right: this is Figma's left 24
            style={[{ right: 24, top: 16 }, count]}
          >
            <Text className="font-cairo-bold text-[8px] leading-[12px] text-white">
              {total > 9 ? '9+' : total}
            </Text>
          </Animated.View>
        )}
      </View>
    </GestureDetector>
  );
}
