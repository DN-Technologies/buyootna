import { fireEvent, render } from '@testing-library/react-native';

import DeactivateAccountModal from '../DeactivateAccountModal';

describe('DeactivateAccountModal', () => {
  it('renders modal title, message and buttons when visible', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const { getByText, getByTestId } = await render(
      <DeactivateAccountModal
        visible={true}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    expect(getByText('تعطيل الحساب مؤقتاً')).toBeTruthy();
    expect(
      getByText(
        'هل تريد تعطيل حسابك مؤقتاً؟ يمكنك تسجيل الدخول مرة أخرى في أي وقت لتنشيطه.'
      )
    ).toBeTruthy();
    expect(getByTestId('deactivate-modal-cancel')).toBeTruthy();
    expect(getByTestId('deactivate-modal-confirm')).toBeTruthy();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const { getByTestId } = await render(
      <DeactivateAccountModal
        visible={true}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    fireEvent.press(getByTestId('deactivate-modal-cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when deactivate button is clicked', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const { getByTestId } = await render(
      <DeactivateAccountModal
        visible={true}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    fireEvent.press(getByTestId('deactivate-modal-confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when backdrop is tapped', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const { getByTestId } = await render(
      <DeactivateAccountModal
        visible={true}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    fireEvent.press(getByTestId('deactivate-modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
