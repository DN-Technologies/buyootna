import { act, render } from '@testing-library/react-native';

import GlobalSignInPrompt from '@/shared/components/auth/GlobalSignInPrompt';
import { requestSignIn } from '@/shared/store/useSignInPrompt';

const mockPresent = jest.fn();
jest.mock('@/shared/components/auth/AuthGuardSheet', () => {
  const { forwardRef, useImperativeHandle } = jest.requireActual('react');
  return forwardRef(function MockSheet(_props: object, ref: unknown) {
    useImperativeHandle(ref, () => ({ present: mockPresent }));
    return null;
  });
});

describe('GlobalSignInPrompt', () => {
  it('opens «تسجيل الدخول» on every request, and not before', async () => {
    await render(<GlobalSignInPrompt />);
    expect(mockPresent).not.toHaveBeenCalled();

    await act(async () => requestSignIn());
    expect(mockPresent).toHaveBeenCalledTimes(1);

    await act(async () => requestSignIn());
    expect(mockPresent).toHaveBeenCalledTimes(2);
  });
});
