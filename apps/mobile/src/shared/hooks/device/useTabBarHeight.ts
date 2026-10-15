import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Breathing room between the last piece of content and the floating tab bar.
const CONTENT_BOTTOM_MARGIN = 40;

/**
 * Height of the floating CustomTabBar (must stay in sync with
 * shared/components/CustomTabBar.tsx's BAR_HEIGHT), plus the padding
 * scrollable screens under any account type's tab navigator should add to
 * their content so the last item isn't hidden behind the bar.
 */
export function useTabBarHeight() {
  const insets = useSafeAreaInsets();
  // Room under the tabs for the system's own bar. Android draws the app edge
  // to edge, so its navigation bar (gesture line or 3 buttons) sits over the
  // app: a fixed 16px let it cover the tabs (QA, Galaxy A36). Its real height
  // is used now, never less than the 16px the design keeps under the tabs.
  const bottomInset =
    Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 16);
  const tabBarHeight = 60 + bottomInset;

  return {
    tabBarHeight,
    bottomInset,
    scrollContentBottomPadding: tabBarHeight + CONTENT_BOTTOM_MARGIN,
  };
}
