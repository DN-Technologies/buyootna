import { act, render } from '@testing-library/react-native';

import apiClient from '@/shared/api/api';
import { resetToIdentityHome } from '@/shared/navigation/getIdentityHomeRoute';

import AddIdentityCompanyScreen from '../add-identity-company';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
}));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('@/shared/api/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));
jest.mock('@/shared/navigation/getIdentityHomeRoute', () => ({
  resetToIdentityHome: jest.fn(),
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const mockRefreshProfile = jest.fn();
const mockSwitchIdentity = jest.fn();
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: object) => unknown) =>
    selector({
      refreshProfile: mockRefreshProfile,
      switchIdentity: mockSwitchIdentity,
    }),
}));

// The multi-step form, reduced to the two callbacks the screen gives it
let mockFormProps: {
  onSubmit: (data: object) => Promise<boolean>;
  onSuccessDone?: () => void | Promise<void>;
};
jest.mock('@/features/auth/components/company/CompanySignupForm', () => ({
  CompanySignupForm: (props: typeof mockFormProps) => {
    mockFormProps = props;
    return null;
  },
}));

const formData = {
  name: 'شركة البناء',
  licenseNumber: '43424332',
  services: '',
  hqLocation: '',
  serviceAreas: '',
  about: '',
  licenseActivity: '',
  licenseExpiry: '',
};

describe('AddIdentityCompanyScreen › العودة الى الرئيسية', () => {
  beforeEach(() => jest.clearAllMocks());

  it('switches to the new company and opens the company home', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: { id: 'company-identity-1', type: 'COMPANY' },
    });
    await render(<AddIdentityCompanyScreen />);

    await act(async () => {
      await mockFormProps.onSubmit(formData);
    });
    await act(async () => {
      await mockFormProps.onSuccessDone?.();
    });

    expect(mockSwitchIdentity).toHaveBeenCalledWith('company-identity-1');
    expect(resetToIdentityHome).toHaveBeenCalledWith('COMPANY');
  });

  it('falls back to the home it was on if the switch fails', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: { id: 'company-identity-1' },
    });
    mockSwitchIdentity.mockRejectedValueOnce(new Error('offline'));
    await render(<AddIdentityCompanyScreen />);

    await act(async () => {
      await mockFormProps.onSubmit(formData);
    });
    await act(async () => {
      await mockFormProps.onSuccessDone?.();
    });

    expect(resetToIdentityHome).toHaveBeenCalledWith(null);
    expect(resetToIdentityHome).not.toHaveBeenCalledWith('COMPANY');
  });
});
