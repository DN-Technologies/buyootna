import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useAuthStore } from '@/shared/store/useAuthStore';

import OfficeHomeScreen from '../office-home';

// The stories tray has its own tests; here it renders nothing
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

jest.mock('@/shared/hooks/notifications/useUnreadNotificationsCount', () => ({
  useUnreadNotificationsCount: () => 2,
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

describe('OfficeHomeScreen (Figma Design Implementation)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      token: 'test-token',
      refreshProfile: jest.fn(),
    });
  });

  it('renders top header with office name and verified badge', async () => {
    const { getByText, getByLabelText } = await render(<OfficeHomeScreen />);

    expect(getByText('مرحبا بك!')).toBeTruthy();
    expect(getByText('الفيروز')).toBeTruthy();
    expect(getByLabelText('الإشعارات')).toBeTruthy();
  });

  it('renders the 2x2 stats grid with proper numbers and labels', async () => {
    const { getByText } = await render(<OfficeHomeScreen />);

    expect(getByText('الإعلانات النشطة')).toBeTruthy();
    expect(getByText('خدمات نشطة')).toBeTruthy();
    expect(getByText('المشاهدات')).toBeTruthy();
    expect(getByText('الرسائل الجديدة')).toBeTruthy();
  });

  it('renders all sections with title and "عرض الكل" buttons', async () => {
    const { getByText, getAllByText } = await render(<OfficeHomeScreen />);

    expect(getByText('اعلاناتي')).toBeTruthy();
    expect(getByText('الخدمات النشطة')).toBeTruthy();
    expect(getByText('عقارات قد تهمك')).toBeTruthy();
    expect(getByText('أحدث المحادثات')).toBeTruthy();
    expect(getByText('نشاط المجموعات')).toBeTruthy();

    const viewAllButtons = getAllByText('عرض الكل');
    expect(viewAllButtons.length).toBe(5);
  });

  it('renders office listing cards with price and manage buttons', async () => {
    const { getAllByText } = await render(<OfficeHomeScreen />);

    const listingTitles = getAllByText('شقة سكني للبيع');
    expect(listingTitles.length).toBeGreaterThanOrEqual(1);

    const manageButtons = getAllByText('إدارة الإعلان');
    expect(manageButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders services cards with description and status tags', async () => {
    const { getByText } = await render(<OfficeHomeScreen />);

    expect(getByText('عقار للايجار')).toBeTruthy();
    expect(getByText('البحث عن عقار للشراء')).toBeTruthy();
    expect(getByText('طلب تنسيق وتبادل عقاري')).toBeTruthy();
    expect(getByText('إدارة الخدمة')).toBeTruthy();
    expect(getByText('12 طلب نشط')).toBeTruthy();
  });

  it('renders market properties with details, location, and income', async () => {
    const { getByText, getAllByText } = await render(<OfficeHomeScreen />);

    expect(getByText('عمارة للبيع')).toBeTruthy();
    expect(getByText('أرض للبدل')).toBeTruthy();
    expect(getByText('السعر غير معلن')).toBeTruthy();
    expect(getAllByText('مدخول العقار').length).toBeGreaterThanOrEqual(1);

    const detailButtons = getAllByText('تفاصيل');
    expect(detailButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders conversation and group activity cards', async () => {
    const { getAllByText } = await render(<OfficeHomeScreen />);

    const clients = getAllByText('عبد العزيز الرشيدي');
    expect(clients.length).toBeGreaterThanOrEqual(1);

    const groups = getAllByText('وسطاء الكويت العقاريين');
    expect(groups.length).toBeGreaterThanOrEqual(1);
  });

  it('navigates when clicking view all on office listings', async () => {
    const { getByLabelText } = await render(<OfficeHomeScreen />);

    const viewAllListings = getByLabelText('عرض الكل اعلاناتي');
    fireEvent.press(viewAllListings);

    expect(router.push).toHaveBeenCalledWith('/(office)/office-properties');
  });

  it('navigates when clicking view all on conversations', async () => {
    const { getByLabelText } = await render(<OfficeHomeScreen />);

    const viewAllChats = getByLabelText('عرض الكل أحدث المحادثات');
    fireEvent.press(viewAllChats);

    expect(router.push).toHaveBeenCalledWith('/(office)/office-chats');
  });
});
