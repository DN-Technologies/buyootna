import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import AccountTypeSelectionScreen from '../selection';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));

describe('«إنشاء حساب» › account type', () => {
  beforeEach(() => jest.clearAllMocks());

  // QA: شركة opened تسجيل الدخول instead of the company sign-up
  it('شركة opens the company sign-up', async () => {
    const { getByText } = await render(<AccountTypeSelectionScreen />);
    await fireEvent.press(getByText('شركة'));
    await fireEvent.press(getByText('بدء التسجيل'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(auth)/business-auth',
      params: { type: 'company', mode: 'signup' },
    });
  });

  it('فرد opens the individual sign-up', async () => {
    const { getByText } = await render(<AccountTypeSelectionScreen />);
    await fireEvent.press(getByText('فرد'));
    await fireEvent.press(getByText('بدء التسجيل'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(auth)/individual-auth',
      params: { mode: 'signup' },
    });
  });
});
