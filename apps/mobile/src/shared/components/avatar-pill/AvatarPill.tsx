import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { type RefObject, useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import PulseQuickView from '@/shared/components/pulse/PulseQuickView';
import { usePulse } from '@/shared/components/pulse/usePulse';
import { FLOATING } from '@/shared/components/ui/floating';
import { useIdentity } from '@/shared/hooks/auth/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';

import { GOLD } from './constants';
import PillActions from './PillActions';
import PillChevron from './PillChevron';
import PillGap, { pillGapState } from './PillGap';
import PillPhoto from './PillPhoto';
import { useHomeBadges } from './useHomeBadges';
import { usePhotoTaps } from './usePhotoTaps';
import { usePillMotion } from './usePillMotion';
import { useQuickViewAnchor } from './useQuickViewAnchor';

export { AVATAR_PILL_OPEN_WIDTH } from './constants';
export { timeOfDayGlyph } from './timeOfDay';

interface AvatarPillProps {
  // Signed out: asks to sign in instead of opening (the individual home;
  // the company and office homes are always signed in)
  authSheetRef?: RefObject<BottomSheetModal | null>;
  // A double tap on the photo: the profile switcher
  onSwitchProfile: () => void;
  // Opening or closing (the top bar makes room on narrow phones)
  onOpenChange?: (open: boolean) => void;
  // White with a shadow, over content
  floating?: boolean;
}

/**
 * The home's avatar pill (Figma 9305:76786 closed, 9297:76305 open): the
 * profile photo with what's unread, or what's going on (the notch). A tap
 * or a sideways swipe opens it to the chats and notifications icons; ›
 * closes it. Its parts are in ./avatar-pill.
 */
export default function AvatarPill({
  authSheetRef,
  onSwitchProfile,
  onOpenChange,
  floating = false,
}: AvatarPillProps) {
  const token = useAuthStore((s) => s.token);
  const { avatarUrl } = useIdentity();
  const { notifications, chats } = useHomeBadges();
  const pulse = usePulse();
  const [open, setOpen] = useState(false);
  const [quickView, setQuickView] = useState(false);
  const { pillRef, anchor, measure } = useQuickViewAnchor();

  const unread = notifications + chats;
  const gap = pillGapState(!!token, unread, pulse);
  const { slotStyle, chevronStyle, gapStyle } = usePillMotion({
    open,
    unread: unread > 0,
    notch: gap === 'pulse',
  });

  const toggle = (next: boolean) => {
    if (!token) {
      authSheetRef?.current?.present();
      return;
    }
    setOpen(next);
    onOpenChange?.(next);
  };

  const onPhotoPress = usePhotoTaps(
    () => toggle(!open),
    () => (token ? onSwitchProfile() : authSheetRef?.current?.present()),
  );

  // RTL: the pill grows to the left, so a swipe left opens it
  const swipe = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onEnd((e) => {
      if (Math.abs(e.translationX) < 24) return;
      runOnJS(toggle)(e.translationX < 0);
    });

  return (
    <>
      <GestureDetector gesture={swipe}>
        <View
          ref={pillRef}
          onLayout={measure}
          testID="avatar-pill"
          className="h-[46px] flex-row items-center rounded-full p-[4px]"
          style={[
            { borderWidth: 0.5, borderColor: GOLD, gap: 8 },
            floating && FLOATING,
          ]}
        >
          <PillPhoto
            avatarUrl={token ? avatarUrl : null}
            open={open}
            onPress={onPhotoPress}
          />
          <PillActions
            open={open}
            slotStyle={slotStyle}
            chatsUnread={chats > 0}
            notificationsUnread={notifications > 0}
          />
          <PillChevron
            open={open}
            chevronStyle={chevronStyle}
            onPress={() => toggle(!open)}
          />
          <PillGap
            state={gap}
            unread={unread}
            pulse={pulse}
            open={open}
            quickViewOpen={quickView}
            fadeStyle={gapStyle}
            onOpenQuickView={() => {
              measure();
              setQuickView(true);
            }}
          />
        </View>
      </GestureDetector>

      <PulseQuickView
        visible={quickView}
        items={pulse}
        anchor={anchor}
        onClose={() => setQuickView(false)}
      />
    </>
  );
}
