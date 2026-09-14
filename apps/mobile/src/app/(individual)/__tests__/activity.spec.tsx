import { useScrollToTop } from '@react-navigation/native';
import { render } from '@testing-library/react-native';

import { useMyActivity } from '@/features/individual/hooks/useMyActivity';
import { useAuthStore } from '@/shared/store/useAuthStore';

import ActivityScreen from '../activity';

jest.mock('@gorhom/bottom-sheet');
jest.mock('@shopify/flash-list');

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), setParams: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/features/individual/hooks/useMyActivity', () => ({
  useMyActivity: jest.fn(),
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
  });
});
