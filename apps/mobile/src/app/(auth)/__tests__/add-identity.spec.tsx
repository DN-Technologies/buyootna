import { render } from '@testing-library/react-native';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

// The account already has an individual persona
jest.mock('@/shared/hooks/auth/useIdentity', () => ({
  useIdentity: () => ({
    canCreateIdentity: (type: string) => type !== 'INDIVIDUAL',
  }),
}));

jest.mock('@/assets/icons/account', () => ({
  CompanyIcon: () => null,
  IndividualIcon: () => null,
  OwnerIcon: () => null,
}));

// The flag is read when the screen module loads
process.env.EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS = 'true';
// eslint-disable-next-line @typescript-eslint/no-require-imports -- must load after the flag is set
const AddIdentityScreen = require('../add-identity').default;

describe('AddIdentityScreen', () => {
  it('offers company and office next to the existing individual account', async () => {
    const { getByText } = await render(<AddIdentityScreen />);
    expect(getByText('حساب فردي')).toBeTruthy();
    expect(getByText('موجود')).toBeTruthy();
    expect(getByText('حساب شركة')).toBeTruthy();
    expect(getByText('حساب مكتب')).toBeTruthy();
  });
});
