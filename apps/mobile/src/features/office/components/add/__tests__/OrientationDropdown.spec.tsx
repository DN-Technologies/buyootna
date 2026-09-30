import { act, fireEvent, render } from '@testing-library/react-native';

import {
  ORIENTATION_OPTIONS,
  OrientationDropdown,
} from '../OrientationDropdown';

describe('OrientationDropdown (Figma 4494:141814 & 4494:142357)', () => {
  it('renders trigger with placeholder when no value is provided', async () => {
    const { getByText, getByTestId, queryByTestId } = await render(
      <OrientationDropdown />,
    );

    expect(getByText('المزايا')).toBeTruthy();
    expect(getByText('ما يميز عقارك')).toBeTruthy();
    expect(getByTestId('orientation-trigger')).toBeTruthy();
    // Dropdown menu should be initially closed
    expect(queryByTestId('orientation-menu')).toBeNull();
  });

  it('renders trigger with selected value when provided', async () => {
    const { getByText } = await render(
      <OrientationDropdown value="بطن وظهر" />,
    );

    expect(getByText('بطن وظهر')).toBeTruthy();
  });

  it('opens menu when trigger is pressed and displays all 6 orientation options', async () => {
    const { getByTestId, getByText } = await render(<OrientationDropdown />);

    await act(async () => {
      fireEvent.press(getByTestId('orientation-trigger'));
    });

    expect(getByTestId('orientation-menu')).toBeTruthy();
    ORIENTATION_OPTIONS.forEach((option) => {
      expect(getByText(option)).toBeTruthy();
    });
  });

  it('calls onSelect and closes menu when an option is pressed', async () => {
    const onSelectMock = jest.fn();
    const { getByTestId, queryByTestId } = await render(
      <OrientationDropdown onSelect={onSelectMock} />,
    );

    // Open menu
    await act(async () => {
      fireEvent.press(getByTestId('orientation-trigger'));
    });

    // Press first option ("بطن وظهر")
    const firstOption = getByTestId('orientation-option-0');
    await act(async () => {
      fireEvent.press(firstOption);
    });

    expect(onSelectMock).toHaveBeenCalledWith('بطن وظهر');
    expect(queryByTestId('orientation-menu')).toBeNull();
  });
});
