import { fireEvent, render } from '@testing-library/react-native';

import DeleteConfirmationSheet from '../DeleteConfirmationSheet';

jest.mock('@gorhom/bottom-sheet');

describe('DeleteConfirmationSheet', () => {
  it('goes to the reason step and confirms with SOLD', async () => {
    const onConfirm = jest.fn();
    const { getByText, queryByText } = await render(
      <DeleteConfirmationSheet onConfirm={onConfirm} />,
    );

    await fireEvent.press(getByText('حذف الإعلان'));
    expect(getByText('ما سبب حذف الاعلان؟')).toBeTruthy();
    expect(queryByText('تراجع')).toBeNull();

    // Disabled until a reason is picked
    await fireEvent.press(getByText('حذف الإعلان'));
    expect(onConfirm).not.toHaveBeenCalled();

    await fireEvent.press(getByText('تم البيع'));
    await fireEvent.press(getByText('حذف الإعلان'));
    expect(onConfirm).toHaveBeenCalledWith('SOLD');
  });

  it('requires text for OTHER and sends it; the field opts out of autofill', async () => {
    const onConfirm = jest.fn();
    const { getByText, getByPlaceholderText } = await render(
      <DeleteConfirmationSheet onConfirm={onConfirm} />,
    );

    await fireEvent.press(getByText('حذف الإعلان'));
    await fireEvent.press(getByText('سبب اخر'));

    const input = getByPlaceholderText('اذكر سبب حذفك للاعلان');
    expect(input.props).toMatchObject({
      autoComplete: 'off',
      textContentType: 'none',
      importantForAutofill: 'no',
    });

    await fireEvent.press(getByText('حذف الإعلان'));
    expect(onConfirm).not.toHaveBeenCalled();

    await fireEvent.changeText(input, 'غيرت رأيي');
    await fireEvent.press(getByText('حذف الإعلان'));
    expect(onConfirm).toHaveBeenCalledWith('غيرت رأيي');
  });

  it('skipReasonStep confirms right away with no reason', async () => {
    const onConfirm = jest.fn();
    const { getByText } = await render(
      <DeleteConfirmationSheet
        onConfirm={onConfirm}
        confirmLabel="حذف التنبيه"
        skipReasonStep
      />,
    );

    await fireEvent.press(getByText('حذف التنبيه'));
    expect(onConfirm).toHaveBeenCalledWith();
  });

  it('تراجع calls onCancel', async () => {
    const onCancel = jest.fn();
    const { getByText } = await render(
      <DeleteConfirmationSheet onConfirm={jest.fn()} onCancel={onCancel} />,
    );

    await fireEvent.press(getByText('تراجع'));
    expect(onCancel).toHaveBeenCalled();
  });
});
