import { useScrollToTop } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render as rtlRender } from '@testing-library/react-native';
import { router } from 'expo-router';
import { ReactElement } from 'react';

import { useMyAlerts } from '@/features/individual/hooks/useMyAlerts';
import { useMyActivity } from '@/shared/hooks/useMyActivity';
import { useAuthStore } from '@/shared/store/useAuthStore';

import ActivityScreen from '../activity';

// The data hooks are mocked, but useAdActions still updates the query cache
// when deleting, so the screen needs a QueryClient
const render = (ui: ReactElement) =>
  rtlRender(
    <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>,
  );

jest.mock('@gorhom/bottom-sheet');
jest.mock('@shopify/flash-list');

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), setParams: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/shared/hooks/useMyActivity', () => ({
  useMyActivity: jest.fn(),
}));

jest.mock('@/features/individual/hooks/useMyAlerts', () => ({
  useMyAlerts: jest.fn(),
}));

jest.mock('@/shared/hooks/useMyRequests', () => ({
  useMyRequests: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

// useTabBarHeight calls useSafeAreaInsets(), which throws without a
// <SafeAreaProvider> ancestor -- stub it rather than wrap every render.
jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

// useScrollToTop needs a real navigation tree to find the parent tab
// navigator, which this test doesn't render -- stub it as a no-op.
// useFocusEffect just needs to run its callback once like a plain effect.
jest.mock('@react-navigation/native', () => ({
  useScrollToTop: jest.fn(),
  useFocusEffect: (callback: () => void) => callback(),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockUseMyActivity = useMyActivity as jest.Mock;
const mockUseMyAlerts = useMyAlerts as jest.Mock;

const DEFAULT_ALERTS_RESULT = {
  data: [],
  isLoading: false,
  error: null,
  refetch: jest.fn(),
};

describe('ActivityScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('guest (no token)', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({ token: null });
      mockUseMyActivity.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        freeAdsRemaining: 0,
        hasSubscription: false,
        subscription: undefined,
      });
      mockUseMyAlerts.mockReturnValue(DEFAULT_ALERTS_RESULT);
    });

    it('shows the guest empty state instead of the activity list', async () => {
      const { getByText } = await render(<ActivityScreen />);

      expect(getByText('ابدأ رحلتك العقارية')).toBeTruthy();
    });
  });

  describe('logged in', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({ token: 'tok-1' });
      mockUseMyActivity.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        freeAdsRemaining: 1,
        hasSubscription: false,
        subscription: undefined,
      });
      mockUseMyAlerts.mockReturnValue(DEFAULT_ALERTS_RESULT);
    });

    it('renders the header title and the empty state when there is no activity yet', async () => {
      const { getByText } = await render(<ActivityScreen />);

      expect(getByText('نشاطي')).toBeTruthy();
      expect(getByText('لا توجد إعلانات حالياً')).toBeTruthy();
    });

    // Regression coverage for the reported bug: tapping the already-active
    // bottom tab did nothing because no screen ever wired up
    // useScrollToTop.
    it('wires the list up to useScrollToTop so tapping the active tab scrolls to top', async () => {
      await render(<ActivityScreen />);

      // The FlashList mock doesn't forward refs (it's a plain function
      // component, so `current` stays null) -- this only checks a ref
      // object was actually passed through to useScrollToTop, not that it
      // resolved to a real list instance.
      expect(useScrollToTop).toHaveBeenCalledWith(
        expect.objectContaining({ current: null }),
      );
    });

    // Pull-to-refresh used to always refetch ads, even on the alerts tab.
    it('pull-to-refresh refetches the list of the active tab', async () => {
      const flashListModule = require('@shopify/flash-list');
      const flashListSpy = jest.spyOn(flashListModule, 'FlashList');
      const refetchAds = jest.fn();
      const refetchAlerts = jest.fn();
      mockUseMyActivity.mockReturnValue({
        ...mockUseMyActivity(),
        refetch: refetchAds,
      });
      mockUseMyAlerts.mockReturnValue({
        ...DEFAULT_ALERTS_RESULT,
        refetch: refetchAlerts,
      });
      const pullToRefresh = () => {
        const props = flashListSpy.mock.calls.at(-1)![0] as {
          refreshControl: { props: { onRefresh: () => void } };
        };
        props.refreshControl.props.onRefresh();
      };

      const { getByText } = await render(<ActivityScreen />);
      // Focus refetches both on mount; only count the pull-to-refresh calls
      refetchAds.mockClear();
      refetchAlerts.mockClear();

      pullToRefresh();
      expect(refetchAds).toHaveBeenCalledTimes(1);
      expect(refetchAlerts).not.toHaveBeenCalled();

      await fireEvent.press(getByText('تنبيهاتي'));
      refetchAds.mockClear();
      refetchAlerts.mockClear();

      pullToRefresh();
      expect(refetchAlerts).toHaveBeenCalledTimes(1);
      expect(refetchAds).not.toHaveBeenCalled();

      flashListSpy.mockRestore();
    });

    it.each([
      ['اعلاناتي', '/add-listing'],
      ['عروضي', '/request-quote'],
      ['تنبيهاتي', '/add-alert'],
    ])('the header + on %s opens %s', async (tab, route) => {
      const { getByText, getByTestId } = await render(<ActivityScreen />);

      await fireEvent.press(getByText(tab));
      await fireEvent.press(getByTestId('activity-add-btn'));

      expect(router.push).toHaveBeenLastCalledWith(route);
    });

    it('tapping the header menu button on the ads tab opens AdsOptionsMenu with hide and delete options', async () => {
      const { getByTestId, getByText } = await render(<ActivityScreen />);

      await fireEvent.press(getByTestId('activity-menu-btn'));

      expect(getByText('اخفاء جميع الاعلانات')).toBeTruthy();
      expect(getByText('حذف الكل')).toBeTruthy();
    });
  });
});
