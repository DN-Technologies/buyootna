import { act, render } from '@testing-library/react-native';

import LaunchOverlay, { useLaunchOverlay } from '../LaunchOverlay';

// The animation itself is covered by LaunchAnimation.spec; here it only
// hands back its onDone
let mockOnDone: (() => void) | undefined;
jest.mock('../LaunchAnimation', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ onDone }: { onDone: () => void }) => {
      mockOnDone = onDone;
      return <View testID="launch-animation" />;
    },
  };
});

jest.mock('react-native-reanimated', () =>
  jest.requireActual('react-native-reanimated/mock'),
);

beforeEach(() => {
  mockOnDone = undefined;
  useLaunchOverlay.setState({ visible: false, shown: false });
});

describe('LaunchOverlay', () => {
  it('shows nothing until the launch asks for it', async () => {
    const { queryByTestId } = await render(<LaunchOverlay />);
    expect(queryByTestId('launch-overlay')).toBeNull();
  });

  it('covers the app while the animation plays, then goes away', async () => {
    const { queryByTestId, getByTestId } = await render(<LaunchOverlay />);
    await act(async () => {
      useLaunchOverlay.getState().show();
    });
    expect(getByTestId('launch-animation')).toBeTruthy();

    // The fade's finish callback runs at once in the reanimated mock
    await act(async () => {
      mockOnDone?.();
    });
    expect(queryByTestId('launch-overlay')).toBeNull();
    expect(useLaunchOverlay.getState().visible).toBe(false);
  });

  it('plays only once per app start', async () => {
    const { queryByTestId } = await render(<LaunchOverlay />);
    await act(async () => {
      useLaunchOverlay.getState().show();
    });
    await act(async () => {
      mockOnDone?.();
    });
    // e.g. something navigating back to the launch route
    await act(async () => {
      useLaunchOverlay.getState().show();
    });
    expect(queryByTestId('launch-overlay')).toBeNull();
  });
});
