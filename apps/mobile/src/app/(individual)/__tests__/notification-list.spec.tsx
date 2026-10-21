import { fireEvent, render } from '@testing-library/react-native';

import { useNotificationList } from '@/features/individual/hooks/useNotificationList';
import { useAuthStore } from '@/shared/store/useAuthStore';

import NotificationListScreen from '../notification-list';

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockDismissTo = jest.fn();
const mockNavigate = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    dismissTo: mockDismissTo,
    navigate: mockNavigate,
  }),
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/features/individual/hooks/useNotificationList', () => ({
  useNotificationList: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  SafeAreaView: ({ children }: any) => <>{children}</>,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('NotificationListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders guest empty state when unauthenticated', async () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue(null);
    (useNotificationList as unknown as jest.Mock).mockReturnValue({
      notifications: [],
      filteredNotifications: [],
      isLoading: false,
      isRefreshing: false,
      handleRefresh: jest.fn(),
      activeTab: 'ALL',
      setActiveTab: jest.fn(),
      hasUnread: false,
    });

    const { getByText } = await render(<NotificationListScreen />);
    expect(getByText('ابق على اطلاع دائم')).toBeTruthy();
  });

  it('renders empty state when there are no notifications', async () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue('mock-token');
    (useNotificationList as unknown as jest.Mock).mockReturnValue({
      notifications: [],
      filteredNotifications: [],
      isLoading: false,
      isRefreshing: false,
      handleRefresh: jest.fn(),
      activeTab: 'ALL',
      setActiveTab: jest.fn(),
      hasUnread: false,
      isMenuVisible: false,
      selectedNotification: null,
      menuAnchorY: 180,
      handleOpenMenu: jest.fn(),
      handleCloseMenu: jest.fn(),
      handleMarkAsRead: jest.fn(),
      handleMarkAllRead: jest.fn(),
      isToastVisible: false,
      handleDeleteNotification: jest.fn(),
      handleUndoDelete: jest.fn(),
      handleDismissToast: jest.fn(),
    });

    const { getByText } = await render(<NotificationListScreen />);
    expect(getByText('لا توجد اشعارات حاليا')).toBeTruthy();
    const exploreBtn = getByText('استكشف الان');
    expect(exploreBtn).toBeTruthy();
    fireEvent.press(exploreBtn);
    // Never '/': that is the launch screen (splash + update check)
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockDismissTo).toHaveBeenCalledWith('/(individual)/home');
    expect(mockNavigate).toHaveBeenCalledWith('/(individual)/home');
  });

  it('explore takes a company back to the company home', async () => {
    const state = { token: 'mock-token', activeIdentity: { type: 'COMPANY' } };
    (useAuthStore as unknown as jest.Mock).mockImplementation(
      (selector: (s: typeof state) => unknown) => selector(state),
    );
    (useNotificationList as unknown as jest.Mock).mockReturnValue({
      notifications: [],
      filteredNotifications: [],
      isLoading: false,
      isRefreshing: false,
      handleRefresh: jest.fn(),
      activeTab: 'ALL',
      setActiveTab: jest.fn(),
      hasUnread: false,
    });

    const { getByText } = await render(<NotificationListScreen />);
    fireEvent.press(getByText('استكشف الان'));
    expect(mockDismissTo).toHaveBeenCalledWith('/(company)/home');
    expect(mockNavigate).toHaveBeenCalledWith('/(company)/home');
  });

  it('renders notifications list and interacts with tabs and actions', async () => {
    const setActiveTab = jest.fn();
    const handleMarkAllRead = jest.fn();
    const handleMarkAsRead = jest.fn();
    const handleOpenMenu = jest.fn();

    const sampleNotifications = [
      {
        id: 'notif-1',
        userId: 'user-1',
        type: 'IDENTITY_APPROVED',
        title: 'عقار جديد مطابق لبحثك',
        body: 'شقة في السالمية • 2 غرفة',
        identityId: null,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ];

    (useAuthStore as unknown as jest.Mock).mockReturnValue('mock-token');
    (useNotificationList as unknown as jest.Mock).mockReturnValue({
      notifications: sampleNotifications,
      filteredNotifications: sampleNotifications,
      isLoading: false,
      isRefreshing: false,
      handleRefresh: jest.fn(),
      activeTab: 'ALL',
      setActiveTab,
      hasUnread: true,
      isMenuVisible: false,
      selectedNotification: null,
      menuAnchorY: 180,
      handleOpenMenu,
      handleCloseMenu: jest.fn(),
      handleMarkAsRead,
      handleMarkAllRead,
      isToastVisible: false,
      handleDeleteNotification: jest.fn(),
      handleUndoDelete: jest.fn(),
      handleDismissToast: jest.fn(),
    });

    const { getByText } = await render(<NotificationListScreen />);
    expect(getByText('عقار جديد مطابق لبحثك')).toBeTruthy();
    expect(getByText('الكل')).toBeTruthy();
    expect(getByText('غير مقروء')).toBeTruthy();

    await fireEvent.press(getByText('غير مقروء'));
    expect(setActiveTab).toHaveBeenCalledWith('UNREAD');

    await fireEvent.press(getByText('تحديد الكل كمقروء'));
    expect(handleMarkAllRead).toHaveBeenCalled();
  });

  it('tapping an alert-match notification marks it read and opens the listing', async () => {
    const handleMarkAsRead = jest.fn();
    const alertMatch = {
      id: 'n1',
      userId: 'u1',
      type: 'ALERT_MATCH',
      title: 'تطابق جديد لتنبيهك',
      body: 'شقة للإيجار في السلام',
      identityId: null,
      isRead: false,
      data: { propertyId: 'prop-1' },
      createdAt: new Date().toISOString(),
    };
    (useAuthStore as unknown as jest.Mock).mockReturnValue('mock-token');
    (useNotificationList as unknown as jest.Mock).mockReturnValue({
      notifications: [alertMatch],
      filteredNotifications: [alertMatch],
      isLoading: false,
      isRefreshing: false,
      handleRefresh: jest.fn(),
      activeTab: 'ALL',
      setActiveTab: jest.fn(),
      hasUnread: true,
      isMenuVisible: false,
      selectedNotification: null,
      menuAnchorY: 180,
      handleOpenMenu: jest.fn(),
      handleCloseMenu: jest.fn(),
      handleMarkAsRead,
      handleToggleRead: jest.fn(),
      handleMarkAllRead: jest.fn(),
      isToastVisible: false,
      handleDeleteNotification: jest.fn(),
      handleUndoDelete: jest.fn(),
      handleDismissToast: jest.fn(),
    });

    const { getByText } = await render(<NotificationListScreen />);
    await fireEvent.press(getByText('شقة للإيجار في السلام'));

    expect(handleMarkAsRead).toHaveBeenCalledWith(alertMatch);
    expect(mockPush).toHaveBeenCalledWith('/property/prop-1');
  });
});
