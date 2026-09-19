import { render } from '@testing-library/react-native';

import { useAuthStore } from '@/shared/store/useAuthStore';

import EditProfileScreen from '../edit-profile';

jest.mock('@/shared/api/settings.service', () => ({
  settingsService: {
    updateProfile: jest.fn(),
  },
}));

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

describe('EditProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders individual form inputs matching design', async () => {
    useAuthStore.setState({
      user: { id: 'user-2', email: 'user@test.com', phone: '+96555100001' } as any,
      activeIdentity: {
        id: 'id-ind-1',
        type: 'INDIVIDUAL',
        individualData: {
          name: 'محمد علي',
        },
      } as any,
    });

    const { getByText, getByPlaceholderText } = await render(<EditProfileScreen />);
    expect(getByText('تعديل الملف الشخصي')).toBeTruthy();
    expect(getByText('الاسم')).toBeTruthy();
    expect(getByText('البريد الالكتروني')).toBeTruthy();
    expect(getByText('رقم الهاتف')).toBeTruthy();
    expect(getByText('رقم الواتساب')).toBeTruthy();
    expect(getByText('تعديل البيانات')).toBeTruthy();
    expect(getByPlaceholderText('أدخل اسمك')).toBeTruthy();
  });
});
