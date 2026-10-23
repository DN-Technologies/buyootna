import { fireEvent, render } from '@testing-library/react-native';

import HomeModeSwitch from '../HomeModeSwitch';

jest.mock('expo-image', () => ({ Image: 'Image' }));

describe('HomeModeSwitch', () => {
  it('names only the selected side, and switches', async () => {
    const onChange = jest.fn();
    const screen = await render(<HomeModeSwitch mode="home" onChange={onChange} />);
    expect(screen.getByText('الرئيسية')).toBeTruthy();
    expect(screen.queryByText('القصص')).toBeNull();
    await fireEvent.press(screen.getByTestId('home-mode-stories'));
    expect(onChange).toHaveBeenCalledWith('stories');
  });
});
