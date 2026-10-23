import { fireEvent, render } from '@testing-library/react-native';

import { requireTermsAccepted, useTermsAgreement } from '../../terms';
import { TermsAgreement } from '../TermsAgreement';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

describe('TermsAgreement (Guideline 1.2: terms before sign-in)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTermsAgreement.setState({ accepted: false });
  });

  it('starts unticked and blocks sign-in until ticked', async () => {
    const { getByTestId } = await render(<TermsAgreement />);
    const box = getByTestId('terms-agreement-checkbox');
    expect(box.props.accessibilityState).toEqual({ checked: false });
    expect(requireTermsAccepted()).toBe(false);

    fireEvent.press(box);
    expect(useTermsAgreement.getState().accepted).toBe(true);
    expect(requireTermsAccepted()).toBe(true);
  });

  it('opens the terms of use', async () => {
    const { getByTestId } = await render(<TermsAgreement />);
    fireEvent.press(getByTestId('terms-agreement-terms-link'));
    expect(mockPush).toHaveBeenCalledWith('/terms');
  });
});
