import { render } from '@testing-library/react-native';

import { useAuthStore } from '@/shared/store/useAuthStore';

import OfficeEditProfileScreen from '../office-edit-profile';

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

describe('OfficeEditProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders office edit profile screen', async () => {
    useAuthStore.setState({
      user: { id: 'user-1', email: 'office@test.com' } as any,
      activeIdentity: {
        id: 'id-office-1',
        type: 'OFFICE',
        officeData: {
          name: 'مكتب المنار',
          licenseNumber: '12345',
        },
      } as any,
    });

    const { getByText } = await render(<OfficeEditProfileScreen />);
    expect(getByText('عن المكتب')).toBeTruthy();
    expect(getByText('رخصة المكتب')).toBeTruthy();
    expect(getByText('حفظ التغييرات')).toBeTruthy();
  });
});
