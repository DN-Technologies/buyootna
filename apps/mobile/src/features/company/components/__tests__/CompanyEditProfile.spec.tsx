import { fireEvent, render, waitFor } from '@testing-library/react-native';

import apiClient from '@/shared/api/api';
import { useAuthStore } from '@/shared/store/useAuthStore';

import CompanyEditProfile from '../CompanyEditProfile';

jest.mock('@/shared/api/api', () => ({
  __esModule: true,
  default: {
    patch: jest.fn(),
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  },
  validateApiUrl: jest.fn(() => 'http://localhost:8000'),
  setAuthToken: jest.fn(),
  setOnUnauthorized: jest.fn(),
}));

jest.mock('@/shared/services/socket.service', () => ({
  socketService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// useTabBarHeight() calls useSafeAreaInsets(), which throws without a real
// <SafeAreaProvider> ancestor -- stub it rather than wrap every render.
jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

const mockRefreshProfile = jest.fn();

const mockCompanyIdentity = {
  id: 'identity-123',
  type: 'COMPANY',
  companyData: {
    name: 'دار العقار الحديث',
    hqLocation: 'السالمية',
    serviceAreas: 'اختر نطاقات الخدمة',
    about:
      'مكتب متخصص في بيع وتأجير العقارات السكنية والتجارية مع خدمات استشارية متكاملة.',
    services: 'من 9 صباحا حتى 5 مساءا',
    licenseActivity: 'تشطيبات،بناء،ديكور،كهرباء',
    licenseNumber: '6743963845',
    licenseExpiry: '15 ابريل 2027',
    logoUrl: 'https://example.com/logo.jpg',
    licenseFileUrl: null,
  },
};

describe('CompanyEditProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 'user-1',
        email: 'salemelshekh@gmail.com',
        phone: '58094586',
      } as any,
      activeIdentity: mockCompanyIdentity as any,
      refreshProfile: mockRefreshProfile,
    });
  });

  it('renders all sections and input labels matching Figma 4410:159865', async () => {
    const { getByText, getByPlaceholderText } = await render(
      <CompanyEditProfile />
    );

    // Header & Section titles
    expect(getByText('تعديل الملف الشخصي')).toBeTruthy();
    expect(getByText('عن الشركة')).toBeTruthy();
    expect(getByText('الرخصة')).toBeTruthy();

    // Section 1: عن الشركة labels
    expect(getByText('الاسم')).toBeTruthy();
    expect(getByText('البريد الالكتروني')).toBeTruthy();
    expect(getByText('رقم الهاتف')).toBeTruthy();
    expect(getByText('رقم الواتساب')).toBeTruthy();
    expect(getByText('المقر الرئيسي')).toBeTruthy();
    expect(getByText('مناطق تقديم الخدمة')).toBeTruthy();
    expect(getByText('نبذة عن الشركة')).toBeTruthy();
    expect(getByText('مواعيد العمل')).toBeTruthy();

    // Section 2: الرخصة labels
    expect(getByText('النشاط')).toBeTruthy();
    expect(getByText('رقم الرخصة')).toBeTruthy();
    expect(getByText('تاريخ انتهاء')).toBeTruthy();
    expect(getByText('الصورة')).toBeTruthy();

    // Input values
    expect(getByPlaceholderText('دار العقار الحديث')).toBeTruthy();
    expect(getByPlaceholderText('salemelshekh@gmail.com')).toBeTruthy();
    expect(getByText('حفظ التغييرات')).toBeTruthy();
  });

  it('Save button starts in disabled state when unmodified (Figma 4410:159865)', async () => {
    const { getByText } = await render(<CompanyEditProfile />);

    const saveButtonText = getByText('حفظ التغييرات');
    fireEvent.press(saveButtonText);

    // Since form is not dirty, patch should NOT be called
    expect(apiClient.patch).not.toHaveBeenCalled();
  });

  it('Save button transitions to active state and submits when modified (Figma 4410:162275)', async () => {
    (apiClient.patch as jest.Mock).mockResolvedValueOnce({
      data: { success: true },
    });

    const { getByTestId, getByDisplayValue } = await render(
      <CompanyEditProfile />
    );

    // Modify the company name
    const nameInput = getByDisplayValue('دار العقار الحديث');
    fireEvent.changeText(nameInput, 'دار العقار الجديد');

    // Wait for the button to transition to enabled state
    await waitFor(() => {
      const button = getByTestId('save-button');
      expect(button.props.accessibilityState?.disabled).toBe(false);
    });

    const saveButton = getByTestId('save-button');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/users/profile',
        expect.objectContaining({
          name: 'دار العقار الجديد',
        })
      );
    });
  });
});
