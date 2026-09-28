import { fireEvent, render } from '@testing-library/react-native';

import ArchivedPropertyActionBar from '../ArchivedPropertyActionBar';

const mockInsets = { top: 0, bottom: 20, left: 0, right: 0 };

describe('ArchivedPropertyActionBar', () => {
  it('renders both Delete and Republish buttons', async () => {
    const onDelete = jest.fn();
    const onRepublish = jest.fn();

    const { getByText, getByTestId } = await render(
      <ArchivedPropertyActionBar
        insets={mockInsets}
        onDelete={onDelete}
        onRepublish={onRepublish}
      />,
    );

    expect(getByText('حذف')).toBeTruthy();
    expect(getByText('إعادة النشر')).toBeTruthy();
    expect(getByTestId('archived-delete-btn')).toBeTruthy();
    expect(getByTestId('archived-republish-btn')).toBeTruthy();
  });

  it('triggers onDelete when delete button is pressed', async () => {
    const onDelete = jest.fn();

    const { getByTestId } = await render(
      <ArchivedPropertyActionBar
        insets={mockInsets}
        onDelete={onDelete}
        onRepublish={jest.fn()}
      />,
    );

    await fireEvent.press(getByTestId('archived-delete-btn'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('triggers onRepublish when republish button is pressed', async () => {
    const onRepublish = jest.fn();

    const { getByTestId } = await render(
      <ArchivedPropertyActionBar
        insets={mockInsets}
        onDelete={jest.fn()}
        onRepublish={onRepublish}
      />,
    );

    await fireEvent.press(getByTestId('archived-republish-btn'));
    expect(onRepublish).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when isDeleting is true', async () => {
    const onDelete = jest.fn();
    const onRepublish = jest.fn();

    const { getByTestId } = await render(
      <ArchivedPropertyActionBar
        insets={mockInsets}
        onDelete={onDelete}
        onRepublish={onRepublish}
        isDeleting={true}
      />,
    );

    const deleteBtn = getByTestId('archived-delete-btn');
    const republishBtn = getByTestId('archived-republish-btn');

    expect(deleteBtn).toBeDisabled();
    expect(republishBtn).toBeDisabled();

    await fireEvent.press(deleteBtn);
    await fireEvent.press(republishBtn);

    expect(onDelete).not.toHaveBeenCalled();
    expect(onRepublish).not.toHaveBeenCalled();
  });

  it('disables buttons when isRepublishing is true', async () => {
    const onDelete = jest.fn();
    const onRepublish = jest.fn();

    const { getByTestId } = await render(
      <ArchivedPropertyActionBar
        insets={mockInsets}
        onDelete={onDelete}
        onRepublish={onRepublish}
        isRepublishing={true}
      />,
    );

    const deleteBtn = getByTestId('archived-delete-btn');
    const republishBtn = getByTestId('archived-republish-btn');

    expect(deleteBtn).toBeDisabled();
    expect(republishBtn).toBeDisabled();

    await fireEvent.press(deleteBtn);
    await fireEvent.press(republishBtn);

    expect(onDelete).not.toHaveBeenCalled();
    expect(onRepublish).not.toHaveBeenCalled();
  });
});
