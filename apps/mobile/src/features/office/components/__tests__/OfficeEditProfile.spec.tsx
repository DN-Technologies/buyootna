import { fireEvent, render, waitFor } from '@testing-library/react-native';

import apiClient from '@/shared/api/api';
import { useAuthStore } from '@/shared/store/useAuthStore';

import OfficeEditProfile from '../edit-profile/OfficeEditProfile';

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

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

const mockRefreshProfile = jest.fn();

const mockOfficeIdentity = {
  id: 'identity-office-123',
  type: 'OFFICE',
  officeData: {
    name: 'المنار للعقارات',
    hqLocation: 'السالمية',
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

describe('OfficeEditProfile (Figma Design Implementation 4494:136911 / 4494:138999)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 'user-1',
        email: 'salemelshekh@gmail.com',
        phone: '58094586',
      } as any,
      activeIdentity: mockOfficeIdentity as any,
      refreshProfile: mockRefreshProfile,
    });
  });

  it('renders all sections and input labels matching Figma 4494:136911', async () => {
    const { getByText, getByPlaceholderText } = await render(
      <OfficeEditProfile />
    );

    // Header & Section titles
    expect(getByText('تعديل الملف الشخصي')).toBeTruthy();
    expect(getByText('عن المكتب')).toBeTruthy();
    expect(getByText('رخصة المكتب')).toBeTruthy();

    // Section 1: عن المكتب labels
    expect(getByText('الاسم')).toBeTruthy();
    expect(getByText('البريد الالكتروني')).toBeTruthy();
    expect(getByText('رقم الهاتف')).toBeTruthy();
    expect(getByText('رقم الواتساب')).toBeTruthy();
    expect(getByText('المقر الرئيسي')).toBeTruthy();
    expect(getByText('نبذة عن الشركة')).toBeTruthy();
    expect(getByText('مواعيد العمل')).toBeTruthy();

    // Section 2: رخصة المكتب labels
    expect(getByText('النشاط')).toBeTruthy();
    expect(getByText('رقم الرخصة')).toBeTruthy();
    expect(getByText('تاريخ انتهاء')).toBeTruthy();
    expect(getByText('الصورة')).toBeTruthy();
    expect(getByText('صورة الرخصة تؤهلك لتوثيق حسابك')).toBeTruthy();

    // Initial input placeholders
    expect(getByPlaceholderText('المنار')).toBeTruthy();
    expect(getByPlaceholderText('salemelshekh@gmail.com')).toBeTruthy();
    expect(getByPlaceholderText('58094586')).toBeTruthy();
    expect(getByPlaceholderText('60468839')).toBeTruthy();
    expect(getByPlaceholderText('السالمية')).toBeTruthy();
    expect(getByPlaceholderText('6743963845')).toBeTruthy();

    // Save button
    expect(getByText('حفظ التغييرات')).toBeTruthy();
  });

  it('Save button starts in disabled state when unmodified', async () => {
    const { getByText } = await render(<OfficeEditProfile />);

    const saveButtonText = getByText('حفظ التغييرات');
    fireEvent.press(saveButtonText);

    // Since form is not dirty, patch should NOT be called
    expect(apiClient.patch).not.toHaveBeenCalled();
  });

  it('Save button transitions to active state and submits when modified', async () => {
    (apiClient.patch as jest.Mock).mockResolvedValueOnce({
      data: { success: true },
    });

    const { getByTestId, getByDisplayValue } = await render(
      <OfficeEditProfile />
    );

    // Modify office name
    const nameInput = getByDisplayValue('المنار للعقارات');
    fireEvent.changeText(nameInput, 'مكتب المنار الحديث');

    await waitFor(() => {
      const button = getByTestId('save-button');
      expect(button.props.accessibilityState?.disabled).toBe(false);
    });

    const saveBtn = getByTestId('save-button');
    fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/users/profile',
        expect.objectContaining({
          name: 'مكتب المنار الحديث',
          licenseNumber: '6743963845',
        })
      );
      expect(mockRefreshProfile).toHaveBeenCalled();
    });
  });
});
