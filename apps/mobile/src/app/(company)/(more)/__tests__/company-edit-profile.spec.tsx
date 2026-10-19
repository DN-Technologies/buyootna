import { render } from '@testing-library/react-native';

import { useAuthStore } from '@/shared/store/useAuthStore';

import CompanyEditProfileScreen from '../company-edit-profile';

// The map picker pulls in the native map, which Jest can't load
jest.mock('@/shared/components/map/MapPickerModal', () => ({
  __esModule: true,
  default: () => null,
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

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe('CompanyEditProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders company edit profile screen', async () => {
    useAuthStore.setState({
      user: { id: 'user-1', email: 'company@test.com' } as any,
      activeIdentity: {
        id: 'id-company-1',
        type: 'COMPANY',
        companyData: {
          name: 'شركة الاستثمار',
          licenseNumber: '12345',
        },
      } as any,
    });

    const { getByText } = await render(<CompanyEditProfileScreen />);
    expect(getByText('عن الشركة')).toBeTruthy();
    expect(getByText('الرخصة')).toBeTruthy();
    expect(getByText('حفظ التغييرات')).toBeTruthy();
  });
});
