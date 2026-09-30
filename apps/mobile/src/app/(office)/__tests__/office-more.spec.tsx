import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatStore } from '@/shared/store/useChatStore';

import OfficeMoreScreen from '../office-more';

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

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect: () => void) => effect(),
}));

jest.mock('@/shared/store/useChatStore', () => ({
  useChatStore: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockUseChatStore = useChatStore as unknown as jest.Mock;

describe('OfficeMoreScreen (Figma Design Implementation 4494:136610)', () => {
  const mockIdentity = {
    id: 'office-123',
    type: 'OFFICE' as const,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    officeData: {
      name: 'المنار للعقارات',
      logoUrl: 'https://example.com/logo.png',
      licenseNumber: '2454685',
      about:
        'مكتب متخصص في بيع وتأجير العقارات السكنية والتجارية مع خدمات استشارية متكاملة.',
      hqLocation: 'السالمية • شمال غرب صليبيخات',
      isVerified: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      user: { id: 'u1', email: 'test@example.com' },
      activeIdentity: mockIdentity,
      identities: [mockIdentity],
      token: 'jwt-token',
      refreshProfile: jest.fn(),
      logout: jest.fn(),
    });
    mockUseChatStore.mockImplementation((selector: any) =>
      selector({
        conversations: [{ id: 'conv-1', unreadCount: 3 }],
        loadConversations: jest.fn(),
      })
    );
  });

  it('renders all sections and items matching Figma 4494:136610', async () => {
    const { getByText, getAllByText } = await render(<OfficeMoreScreen />);

    // Header card
    expect(getAllByText('المنار للعقارات')[0]).toBeTruthy();
    expect(getAllByText('مكتب')[0]).toBeTruthy();
    expect(getByText('الرخصة: 2454685')).toBeTruthy();
    expect(
      getByText(
        'مكتب متخصص في بيع وتأجير العقارات السكنية والتجارية مع خدمات استشارية متكاملة.'
      )
    ).toBeTruthy();
    expect(getByText('السالمية • شمال غرب صليبيخات')).toBeTruthy();
    expect(getByText('تعديل')).toBeTruthy();

    // Section 1: إدارة الأعمال
    expect(getByText('ادارة الأعمال')).toBeTruthy();
    expect(getByText('الاعلانات')).toBeTruthy();
    expect(getByText('الخدمات')).toBeTruthy();

    // Section 2: نشاطي
    expect(getByText('نشاطي')).toBeTruthy();
    expect(getByText('المحادثات')).toBeTruthy();
    expect(getByText('المفضلة')).toBeTruthy();

    // Section 3: التقييمات
    expect(getByText('التقييمات')).toBeTruthy();
    expect(getByText('التقييمات والمراجعات')).toBeTruthy();

    // Section 4: الحساب والاشتراك
    expect(getByText('الحساب والاشتراك')).toBeTruthy();
    expect(getByText('الباقات')).toBeTruthy();
    expect(getByText('رصيد الحساب')).toBeTruthy();
    expect(getByText('الفواتير')).toBeTruthy();

    // Section 5: الإعدادات
    expect(getByText('الإعدادات')).toBeTruthy();
    expect(getByText('اعدادات الحساب')).toBeTruthy();

    // Logout & Footer
    expect(getAllByText('تسجيل الخروج')[0]).toBeTruthy();
    expect(getByText('تم انشاء وتطوير التطبيق بواسطة دار النخبة')).toBeTruthy();
  });

  it('navigates when pressing menu items and edit profile', async () => {
    const { getByText } = await render(<OfficeMoreScreen />);

    fireEvent.press(getByText('تعديل'));
    expect(router.push).toHaveBeenCalledWith('/office-edit-profile');

    fireEvent.press(getByText('الاعلانات'));
    expect(router.push).toHaveBeenCalledWith('/(office)/office-properties');

    fireEvent.press(getByText('الخدمات'));
    expect(router.push).toHaveBeenCalledWith('/add-service');

    fireEvent.press(getByText('المحادثات'));
    expect(router.push).toHaveBeenCalledWith('/(office)/office-chats');

    fireEvent.press(getByText('المفضلة'));
    expect(router.push).toHaveBeenCalledWith('/favorites');

    fireEvent.press(getByText('التقييمات والمراجعات'));
    expect(router.push).toHaveBeenCalledWith('/reviews');

    fireEvent.press(getByText('الباقات'));
    expect(router.push).toHaveBeenCalledWith('/plans');

    fireEvent.press(getByText('رصيد الحساب'));
    expect(router.push).toHaveBeenCalledWith('/account-balance');

    fireEvent.press(getByText('الفواتير'));
    expect(router.push).toHaveBeenCalledWith('/invoices');

    fireEvent.press(getByText('اعدادات الحساب'));
    expect(router.push).toHaveBeenCalledWith('/settings');
  });
});
