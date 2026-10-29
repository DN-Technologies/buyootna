import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useOfficeHome } from '@/features/office/hooks/useOfficeHome';
import { useAuthStore } from '@/shared/store/useAuthStore';

import OfficeHomeScreen from '../office-home';

// The stories tray has its own tests; here it renders nothing
// The pill (logo, notch, chats and bell) has its own specs
jest.mock('@/shared/components/avatar-pill/AvatarPill', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="avatar-pill" /> };
});
jest.mock('@/features/auth/components/ProfileBottomSheet', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/features/stories/components/StoryTray', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@gorhom/bottom-sheet');

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useRouter: () => jest.requireMock('expo-router').router,
  useLocalSearchParams: () => ({}),
}));

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect: () => void) => effect(),
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  ...jest.requireActual('@/shared/store/useAuthStore'),
  useAuthStore: jest.fn(),
}));

jest.mock('@/shared/hooks/auth/useIdentity', () => ({
  useIdentity: () => ({
    activeIdentity: {
      id: 'off-1',
      type: 'OFFICE',
      isActive: true,
      officeData: {
        name: 'الفيروز',
        isVerified: true,
      },
    },
    displayName: 'الفيروز',
    avatarUrl: null,
    isVerified: true,
  }),
}));

jest.mock('@/features/office/hooks/useOfficeHome', () => ({
  useOfficeHome: jest.fn(),
}));

// The directory row loads its own data; it has nothing to show here
jest.mock(
  '@/features/office/components/home/OfficeBusinessSectors',
  () => ({ __esModule: true, default: () => null }),
);

jest.mock('@/shared/hooks/notifications/useUnreadNotificationsCount', () => ({
  useUnreadNotificationsCount: () => 2,
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockUseOfficeHome = useOfficeHome as unknown as jest.Mock;

const DASHBOARD = {
  stats: {
    activeListings: 5,
    activeListingsThisWeek: 3,
    activeServices: 2,
    newMessagesToday: 4,
    totalViews: 712,
  },
  billing: { hasActivePackage: true, adsRemaining: 4, freeAdsRemaining: 0 },
  listings: [
    {
      id: 'p1',
      type: 'SALE',
      category: 'APARTMENT',
      price: 150000,
      images: [],
      isFeatured: true,
      featuredUntil: null,
      views: 100,
      favoritesCount: 20,
      chatsCount: 3,
    },
  ],
  services: [
    { title: 'عقار للايجار', openRequests: 12 },
    { title: 'تبادل عقاري', openRequests: 0 },
  ],
};

const MARKET = [
  {
    id: 'm1',
    images: [],
    price: null,
    companyName: 'مكتب',
    isFeatured: false,
    type: 'سكني',
    categoryLabel: 'أرض',
    listingType: 'EXCHANGE',
    requestYear: 2021,
    requiredYear: 2023,
    area: 200,
    beds: 0,
    baths: 0,
    location: 'السالمية',
    createdAt: '2026-10-01T00:00:00Z',
  },
];

const CONVERSATION = {
  id: 'c1',
  otherUser: { name: 'عبد العزيز الرشيدي', avatarUrl: null },
  propertyContext: null,
  lastMessage: {
    content: 'هل متاح معاينة الشقة؟',
    createdAt: '2026-10-29T10:00:00Z',
  },
  unreadCount: 3,
  updatedAt: '2026-10-29T10:00:00Z',
};

function homeWith(overrides: Record<string, unknown> = {}) {
  return {
    identityId: 'off-1',
    dashboard: DASHBOARD,
    isDashboardLoading: false,
    dashboardError: null,
    market: MARKET,
    isMarketLoading: false,
    conversations: [CONVERSATION],
    refetch: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('OfficeHomeScreen (Figma 4494:140318 and its states)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      token: 'test-token',
      refreshProfile: jest.fn(),
    });
    mockUseOfficeHome.mockReturnValue(homeWith());
  });

  it('the header is the home pill alone (no greeting, name or story row)', async () => {
    const { queryByText, getByTestId } = await render(<OfficeHomeScreen />);

    expect(getByTestId('avatar-pill')).toBeTruthy();
    expect(queryByText('مرحبا بك!')).toBeNull();
    expect(queryByText('الفيروز')).toBeNull();
  });

  it('shows the real stats in the 2x2 grid', async () => {
    const { getByText } = await render(<OfficeHomeScreen />);

    expect(getByText('3 هذا الأسبوع')).toBeTruthy();
    expect(getByText('4 اليوم')).toBeTruthy();
    expect(getByText('700+')).toBeTruthy();
    expect(getByText('خدمات نشطة')).toBeTruthy();
  });

  it("lists the office's ads with their counts and a manage button", async () => {
    const { getByText } = await render(<OfficeHomeScreen />);

    expect(getByText('اعلانات المكتب')).toBeTruthy();
    expect(getByText('شقة للبيع')).toBeTruthy();
    expect(getByText('150,000')).toBeTruthy();
    expect(getByText('مميز')).toBeTruthy();

    await fireEvent.press(getByText('إدارة الإعلان'));
    expect(router.push).toHaveBeenCalledWith('/(office)/office-properties');
  });

  it('offers a package when the office has no ads and cannot publish', async () => {
    mockUseOfficeHome.mockReturnValue(
      homeWith({
        dashboard: {
          ...DASHBOARD,
          listings: [],
          billing: { hasActivePackage: false, adsRemaining: 0, freeAdsRemaining: 0 },
        },
      }),
    );
    const { getByText, queryByText } = await render(<OfficeHomeScreen />);

    expect(getByText('استقبال رسائل من العملاء.')).toBeTruthy();
    expect(queryByText('إدارة الإعلان')).toBeNull();
    await fireEvent.press(getByText('اشتر باقة اعلانات'));
    expect(router.push).toHaveBeenCalledWith('/plans');
  });

  it('sends an office that can publish to add its first ad', async () => {
    mockUseOfficeHome.mockReturnValue(
      homeWith({ dashboard: { ...DASHBOARD, listings: [] } }),
    );
    const { getByText } = await render(<OfficeHomeScreen />);

    await fireEvent.press(getByText('ابدأ بإضافة أول إعلان لك'));
    expect(router.push).toHaveBeenCalledWith('/(office)/add');
  });

  it("shows the office's services with their open requests", async () => {
    const { getByText, getAllByText } = await render(<OfficeHomeScreen />);

    expect(getByText('عقار للايجار')).toBeTruthy();
    expect(getByText('12 طلب نشط')).toBeTruthy();
    // No open requests: no pill
    expect(getAllByText(/طلب نشط/)).toHaveLength(1);
  });

  it('hides the services section when the profile lists none', async () => {
    mockUseOfficeHome.mockReturnValue(
      homeWith({ dashboard: { ...DASHBOARD, services: [] } }),
    );
    const { queryByText } = await render(<OfficeHomeScreen />);

    expect(queryByText('الخدمات')).toBeNull();
  });

  it('shows market ads, with no price and exchange years', async () => {
    const { getByText } = await render(<OfficeHomeScreen />);

    expect(getByText('عقارات السوق')).toBeTruthy();
    expect(getByText('أرض للبدل')).toBeTruthy();
    expect(getByText('السعر غير معلن')).toBeTruthy();
    expect(getByText('طلب 2021')).toBeTruthy();
  });

  it('shows the latest chats and no group activity section', async () => {
    const { getByText, getByLabelText, queryByText } = await render(
      <OfficeHomeScreen />,
    );

    expect(getByText('أحدث المحادثات')).toBeTruthy();
    expect(getByText('عبد العزيز الرشيدي')).toBeTruthy();
    expect(queryByText('نشاط المجموعات')).toBeNull();

    await fireEvent.press(getByLabelText('عرض الكل أحدث المحادثات'));
    expect(router.push).toHaveBeenCalledWith('/(office)/office-chats');
  });

  it('offers a retry when the dashboard fails to load', async () => {
    const home = homeWith({
      dashboard: undefined,
      dashboardError: 'فشل في تحميل البيانات',
    });
    mockUseOfficeHome.mockReturnValue(home);
    const { getByText } = await render(<OfficeHomeScreen />);

    await fireEvent.press(getByText('إعادة المحاولة'));
    expect(home.refetch).toHaveBeenCalled();
  });
});
