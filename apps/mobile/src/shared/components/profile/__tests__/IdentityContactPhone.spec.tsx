import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { contactPhoneService } from '@/shared/api/contactPhone.service';
import IdentityContactPhone from '@/shared/components/profile/IdentityContactPhone';

jest.mock('@/shared/api/contactPhone.service', () => ({
  contactPhoneService: {
    get: jest.fn(),
    requestOtp: jest.fn().mockResolvedValue({ destination: '+965****6666' }),
    verify: jest.fn(),
    setUseAccountPhone: jest.fn(),
  },
}));

// The code sheet is a bottom sheet; its own behaviour is covered elsewhere
jest.mock('@/features/individual/components/more/change-password', () => ({
  ChangePasswordOtpSheet: () => null,
}));

const service = contactPhoneService as jest.Mocked<typeof contactPhoneService>;

const state = (overrides = {}) => ({
  useAccountPhone: true,
  accountPhone: '+96599990000',
  contactPhone: null,
  contactPhoneVerified: false,
  effectivePhone: '+96599990000',
  ...overrides,
});

describe('IdentityContactPhone', () => {
  beforeEach(() => jest.clearAllMocks());

  it("is ticked by default and shows the account's number", async () => {
    service.get.mockResolvedValue(state());
    const { findByText, getByTestId } = await render(<IdentityContactPhone />);

    expect(await findByText('يتواصل معك الناس على 99990000')).toBeTruthy();
    expect(
      getByTestId('identity-contact-phone-checkbox').props.accessibilityState,
    ).toMatchObject({ checked: true });
  });

  it('a new own number goes through the SMS code before it is used', async () => {
    service.get.mockResolvedValue(state());
    const { findByTestId, getByTestId } = await render(
      <IdentityContactPhone />,
    );

    await fireEvent.press(await findByTestId('identity-contact-phone-checkbox'));
    await fireEvent.changeText(
      getByTestId('identity-contact-phone-input'),
      '55556666',
    );
    await fireEvent.press(getByTestId('identity-contact-phone-save'));

    await waitFor(() =>
      expect(service.requestOtp).toHaveBeenCalledWith('55556666'),
    );
    // Not switched over until the code is checked
    expect(service.setUseAccountPhone).not.toHaveBeenCalled();
  });

  it('switches back to an already verified own number without a new code', async () => {
    service.get.mockResolvedValue(
      state({ contactPhone: '+96555556666', contactPhoneVerified: true }),
    );
    service.setUseAccountPhone.mockResolvedValue(
      state({
        useAccountPhone: false,
        contactPhone: '+96555556666',
        contactPhoneVerified: true,
      }),
    );
    const { findByTestId, getByTestId } = await render(
      <IdentityContactPhone />,
    );

    await fireEvent.press(await findByTestId('identity-contact-phone-checkbox'));
    await fireEvent.press(getByTestId('identity-contact-phone-save'));

    await waitFor(() =>
      expect(service.setUseAccountPhone).toHaveBeenCalledWith(false),
    );
    expect(service.requestOtp).not.toHaveBeenCalled();
  });

  it("ticking the box goes back to the account's phone", async () => {
    service.get.mockResolvedValue(
      state({
        useAccountPhone: false,
        contactPhone: '+96555556666',
        contactPhoneVerified: true,
      }),
    );
    service.setUseAccountPhone.mockResolvedValue(state());
    const { findByTestId } = await render(<IdentityContactPhone />);

    await fireEvent.press(await findByTestId('identity-contact-phone-checkbox'));

    await waitFor(() =>
      expect(service.setUseAccountPhone).toHaveBeenCalledWith(true),
    );
  });
});
