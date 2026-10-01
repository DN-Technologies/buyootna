import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatStore } from '@/shared/store/useChatStore';

import CompanyMoreScreen from '../company-more';

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

describe('CompanyMoreScreen (Figma Design Implementation)', () => {
  const mockIdentity = {
    id: 'comp-123',
    type: 'COMPANY' as const,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    companyData: {
      name: 'المنار للعقارات',
      logoUrl: 'https://example.com/logo.png',
      about:
        'شركة متخصصة في صيانة وتركيب وتعديل كافة الاعمال الكهربائية مع خدمات استشارية متكاملة.',
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

  it('renders all sections and items matching Figma', async () => {
    const { getByText, getAllByText } = await render(<CompanyMoreScreen />);

    // Header card
    expect(getAllByText('المنار للعقارات')[0]).toBeTruthy();
    expect(
      getByText(
        'شركة متخصصة في صيانة وتركيب وتعديل كافة الاعمال الكهربائية مع خدمات استشارية متكاملة.'
      )
    ).toBeTruthy();
    expect(getByText('السالمية • شمال غرب صليبيخات')).toBeTruthy();

    // Section 1: إدارة الأعمال
    expect(getByText('ادارة الأعمال')).toBeTruthy();
    expect(getByText('الخدمات')).toBeTruthy();
    expect(getByText('معرض الأعمال')).toBeTruthy();
    expect(getByText('فواتير الخدمات')).toBeTruthy();

    // Section 2: نشاطي
    expect(getByText('نشاطي')).toBeTruthy();
    expect(getByText('المحادثات')).toBeTruthy();
    expect(getByText('المحفوظات')).toBeTruthy();

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

  it('navigates when pressing menu items', async () => {
    const { getByText } = await render(<CompanyMoreScreen />);

    fireEvent.press(getByText('الخدمات'));
    expect(router.push).toHaveBeenCalledWith('/add-service');

    fireEvent.press(getByText('معرض الأعمال'));
    expect(router.push).toHaveBeenCalledWith('/add-project');

    fireEvent.press(getByText('فواتير الخدمات'));
    expect(router.push).toHaveBeenCalledWith('/company-service-invoices');

    fireEvent.press(getByText('المحادثات'));
    expect(router.push).toHaveBeenCalledWith('/(company)/company-chats');

    fireEvent.press(getByText('المحفوظات'));
    expect(router.push).toHaveBeenCalledWith('/favorites');

    fireEvent.press(getByText('اعدادات الحساب'));
    expect(router.push).toHaveBeenCalledWith('/settings');
  });
});
