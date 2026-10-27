import { act, render, waitFor } from '@testing-library/react-native';

import LaunchAnimation from '../LaunchAnimation';

const mockPlay = jest.fn();
let mockLottieProps: {
  progress?: number;
  onAnimationFinish?: (isCancelled: boolean) => void;
  onAnimationFailure?: (error: string) => void;
} = {};

// Loads at once (unless told not to) and records play(); the test fires
// the finish callback
let mockFiresLoaded = true;
jest.mock('lottie-react-native', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: React.forwardRef(function MockLottieView(
      props: { onAnimationLoaded?: () => void } & typeof mockLottieProps,
      ref: unknown,
    ) {
      mockLottieProps = props;
      React.useImperativeHandle(ref, () => ({ play: mockPlay }));
      // Fires once on mount, like the native load event
      React.useEffect(() => {
        if (mockFiresLoaded) props.onAnimationLoaded?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return <View testID="lottie" />;
    }),
  };
});

let mockReducedMotion = false;
jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  useReducedMotion: () => mockReducedMotion,
}));

beforeEach(() => {
  jest.useFakeTimers();
  mockPlay.mockClear();
  mockLottieProps = {};
  mockReducedMotion = false;
  mockFiresLoaded = true;
});

afterEach(() => {
  jest.useRealTimers();
});

describe('LaunchAnimation', () => {
  it('plays the whole animation on every open', async () => {
    for (let open = 0; open < 2; open++) {
      mockPlay.mockClear();
      const onDone = jest.fn();
      const { unmount } = await render(<LaunchAnimation onDone={onDone} />);
      await waitFor(() => expect(mockPlay).toHaveBeenCalledWith(0, 336));

      await act(async () => {
        mockLottieProps.onAnimationFinish?.(false);
      });
      expect(onDone).toHaveBeenCalledTimes(1);
      await unmount();
    }
  });

  it('ignores a cancelled play', async () => {
    const onDone = jest.fn();
    await render(<LaunchAnimation onDone={onDone} />);
    await waitFor(() => expect(mockPlay).toHaveBeenCalled());
    await act(async () => {
      mockLottieProps.onAnimationFinish?.(true);
    });
    expect(onDone).not.toHaveBeenCalled();
  });

  it('shows the full logo still with Reduce Motion on', async () => {
    mockReducedMotion = true;
    const onDone = jest.fn();
    await render(<LaunchAnimation onDone={onDone} />);
    await waitFor(() =>
      expect(mockLottieProps.progress).toBeCloseTo(280 / 336),
    );
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('never holds launch: a failure or 8 s still finish, once', async () => {
    const onFailure = jest.fn();
    await render(<LaunchAnimation onDone={onFailure} />);
    await waitFor(() => expect(mockPlay).toHaveBeenCalled());
    await act(async () => {
      mockLottieProps.onAnimationFailure?.('bad composition');
    });
    expect(onFailure).toHaveBeenCalledTimes(1);

    const onTimeout = jest.fn();
    await render(<LaunchAnimation onDone={onTimeout} />);
    await act(async () => {
      jest.advanceTimersByTime(8000);
    });
    expect(onTimeout).toHaveBeenCalledTimes(1);
    await act(async () => {
      mockLottieProps.onAnimationFinish?.(false);
    });
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('plays even if the loaded event never comes', async () => {
    mockFiresLoaded = false;
    await render(<LaunchAnimation onDone={jest.fn()} />);
    await act(async () => {
      jest.advanceTimersByTime(499);
    });
    expect(mockPlay).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(mockPlay).toHaveBeenCalledWith(0, 336);
    expect(mockPlay).toHaveBeenCalledTimes(1);
  });
});
