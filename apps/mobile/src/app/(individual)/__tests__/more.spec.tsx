import { useScrollToTop } from '@react-navigation/native';
import { fireEvent, render } from '@testing-library/react-native';

import { useUnreadNotificationsCount } from '@/shared/hooks/notifications/useUnreadNotificationsCount';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatStore } from '@/shared/store/useChatStore';

import ProfileDashboardScreen from '../more';

jest.mock('@gorhom/bottom-sheet');

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useRouter: () => jest.requireMock('expo-router').router,
  useLocalSearchParams: () => ({}),
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  ...jest.requireActual('@/shared/store/useAuthStore'),
  useAuthStore: jest.fn(),
}));

// useTabBarHeight calls useSafeAreaInsets(), which throws without a
// <SafeAreaProvider> ancestor -- stub it rather than wrap every render.
jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

// useFocusEffect needs a real NavigationContainer ancestor otherwise --
// just run the effect once, matching what "screen is focused" means here.
// (No requireActual spread: more.tsx only imports useFocusEffect from this
// package, and pulling in the rest of the real module here was loading
// real navigation internals that broke expo-router's own mock.) Same reason
// useScrollToTop is stubbed as a no-op: it also needs a real navigation tree
// to find the parent tab navigator, which this test doesn't render.
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect: () => void) => effect(),
  useScrollToTop: jest.fn(),
}));

jest.mock('@/shared/store/useChatStore', () => ({
  useChatStore: jest.fn(),
}));

jest.mock('@/shared/hooks/notifications/useUnreadNotificationsCount', () => ({
  useUnreadNotificationsCount: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockUseChatStore = useChatStore as unknown as jest.Mock;
const mockUseUnreadNotificationsCount =
  useUnreadNotificationsCount as jest.Mock;

const chatState = {
  conversations: [],
  loadConversations: jest.fn(),
};

describe('ProfileDashboardScreen (More tab)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseChatStore.mockImplementation((selector: (s: typeof chatState) => unknown) =>
      selector(chatState),
    );
    mockUseUnreadNotificationsCount.mockReturnValue(0);
  });

  describe('guest (no token)', () => {
    beforeEach(() => {
      const authState = {
        user: null,
        token: null,
        logout: jest.fn(),
        refreshProfile: jest.fn(),
        activeIdentity: null,
        identities: [] as unknown[],
        switchIdentity: jest.fn(),
        addIdentity: jest.fn(),
        removeIdentity: jest.fn(),
        updateActiveIdentity: jest.fn(),
      };
      mockUseAuthStore.mockImplementation((selector?: (s: typeof authState) => unknown) =>
        selector ? selector(authState) : authState,
      );
    });

    it('shows the guest greeting card and a login button, not the account header', async () => {
      const { getByText, queryByText } = await render(
        <ProfileDashboardScreen />,
      );

      expect(getByText('مرحبا بك !')).toBeTruthy();
      expect(getByText('تسجيل الدخول')).toBeTruthy();
      expect(queryByText('تسجيل الخروج')).toBeNull();
    });

    it('puts إنشاء حساب and تسجيل الدخول side by side in the card, with no second login button', async () => {
      const { getAllByText, getByTestId } = await render(
        <ProfileDashboardScreen />,
      );
      const { router: mockRouter } = jest.requireMock('expo-router');

      expect(getAllByText('تسجيل الدخول')).toHaveLength(1);

      await fireEvent.press(getByTestId('guest-create-account'));
      expect(mockRouter.push).toHaveBeenCalledWith('/(auth)/selection');

      await fireEvent.press(getByTestId('guest-login'));
      expect(mockRouter.push).toHaveBeenCalledWith('/(auth)/individual-auth');
    });

    // Regression coverage for the reported bug: tapping the already-active
    // bottom tab did nothing because no screen ever wired up
    // useScrollToTop, so the tabPress event the tab bar already emits had
    // no listener to scroll the content back to the top.
    it('wires the scroll view up to useScrollToTop so tapping the active tab scrolls to top', async () => {
      await render(<ProfileDashboardScreen />);

      expect(useScrollToTop).toHaveBeenCalledWith(
        expect.objectContaining({ current: expect.anything() }),
      );
    });
  });

  describe('logged in', () => {
    const activeIdentity = {
      id: 'identity-1',
      type: 'INDIVIDUAL' as const,
      isActive: true,
      individualData: { name: 'Ahmed', avatarUrl: null },
    };

    beforeEach(() => {
      const authState = {
        user: { email: 'ahmed@example.com', phone: null },
        token: 'tok-1',
        logout: jest.fn(),
        refreshProfile: jest.fn(),
        activeIdentity,
        identities: [activeIdentity],
        switchIdentity: jest.fn(),
        addIdentity: jest.fn(),
        removeIdentity: jest.fn(),
        updateActiveIdentity: jest.fn(),
      };
      mockUseAuthStore.mockImplementation((selector?: (s: typeof authState) => unknown) =>
        selector ? selector(authState) : authState,
      );
    });

    it('renders the account header with the display name and no crash when there is no avatar', async () => {
      const { getAllByText, getByText } = await render(
        <ProfileDashboardScreen />,
      );

      // "Ahmed" also appears in the always-mounted (but not presented)
      // ProfileBottomSheet identity switcher, so there's more than one.
      expect(getAllByText('Ahmed').length).toBeGreaterThan(0);
      expect(getByText('ahmed@example.com')).toBeTruthy();
      // Avatar rendering/fallback itself is covered by Avatar.spec.tsx --
      // this just confirms this screen doesn't crash while wiring it in.
    });

    it('navigates to edit-profile when the edit button is pressed', async () => {
      const { getByText } = await render(<ProfileDashboardScreen />);

      fireEvent.press(getByText('تعديل'));

      const { router: mockRouter } = jest.requireMock('expo-router');
      expect(mockRouter.push).toHaveBeenCalledWith('/edit-profile');
    });

    it('offers only the edit button -- no preview or share', async () => {
      const { getByText, queryByText } = await render(
        <ProfileDashboardScreen />,
      );

      expect(getByText('تعديل')).toBeTruthy();
      expect(queryByText('معاينة')).toBeNull();
      expect(queryByText('مشاركة')).toBeNull();
    });

    // Auctions and deals come later (shared/config/features.ts)
    it('has no الصفقات or المزادات rows', async () => {
      const { queryByText } = await render(<ProfileDashboardScreen />);

      expect(queryByText('الصفقات')).toBeNull();
      expect(queryByText('المزادات')).toBeNull();
    });
  });
});
