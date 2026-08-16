import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Breathing room between the last piece of content and the floating tab bar.
const CONTENT_BOTTOM_MARGIN = 40;

/**
 * Height of the floating CustomTabBar (must stay in sync with
 * features/individual/components/CustomTabBar.tsx's BAR_HEIGHT), plus the
 * padding scrollable screens under the (individual) tab navigator should add
 * to their content so the last item isn't hidden behind the bar.
 */
export function useTabBarHeight() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + (Platform.OS === 'ios' ? insets.bottom : 16);

  return {
    tabBarHeight,
    scrollContentBottomPadding: tabBarHeight + CONTENT_BOTTOM_MARGIN,
  };
}
