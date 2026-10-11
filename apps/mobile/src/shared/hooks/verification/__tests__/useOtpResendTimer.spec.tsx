import { act, cleanup, fireEvent, render } from '@testing-library/react-native';
import { AppState, Text, TouchableOpacity } from 'react-native';

import { ResendOtpResult, useOtpResendTimer } from '../useOtpResendTimer';

// renderHook() from this testing-library version doesn't reliably flush
// effects across repeated renders in this environment -- render() of a
// real component tree, the pattern already proven elsewhere in this
// codebase (IndividualSignupOtpStep.spec.tsx), doesn't have that problem,
// so the hook is exercised through a minimal harness component instead.
// Timer-advancing act() calls must be `await act(async () => ...)`, not a
// synchronous act(() => ...) -- matching that proven file exactly, since
// the synchronous form doesn't reliably flush the resulting re-render here.
function TimerHarness({ initialSeconds }: { initialSeconds: number }) {
  const { secondsLeft, isReady, limitReachedMessage, handleResendResult } =
    useOtpResendTimer(initialSeconds);

  return (
    <>
      <Text testID="state">
        {limitReachedMessage ?? (isReady ? 'ready' : String(secondsLeft))}
      </Text>
      <TouchableOpacity
        testID="trigger"
        onPress={() => handleResendResult(pendingResult.current!)}
      >
        <Text>trigger</Text>
      </TouchableOpacity>
    </>
  );
}

// Simplest way to hand an arbitrary ResendOtpResult into the harness from
// a test without threading more props/state through it.
const pendingResult = { current: null as ResendOtpResult | null };

async function renderTimer(initialSeconds: number) {
  const utils = await render(<TimerHarness initialSeconds={initialSeconds} />);
  const trigger = async (result: ResendOtpResult) => {
    pendingResult.current = result;
    await act(async () => {
      fireEvent.press(utils.getByTestId('trigger'));
    });
  };
  return { ...utils, trigger };
}

describe('useOtpResendTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('counts down to ready once the full duration has elapsed', async () => {
    const { getByTestId } = await renderTimer(30);
    expect(getByTestId('state').props.children).toBe('30');

    await act(async () => {
      jest.advanceTimersByTime(30_000);
    });
    expect(getByTestId('state').props.children).toBe('ready');
  });

  // Regression coverage for the reported bug: the timer must reflect real
  // elapsed wall-clock time on return to foreground, not resume counting
  // down from wherever it was frozen while backgrounded.
  it('reflects real elapsed time immediately on foreground instead of resuming from where it froze', async () => {
    const addListenerSpy = jest.spyOn(AppState, 'addEventListener');
    const { getByTestId } = await renderTimer(30);

    expect(getByTestId('state').props.children).toBe('30');

    // React StrictMode double-invokes effects (mount -> cleanup -> mount),
    // so this can be registered twice; the last one is the one still
    // subscribed to the currently-mounted instance.
    const appStateListener = addListenerSpy.mock.calls
      .filter((call) => call[0] === 'change')
      .at(-1)?.[1] as (status: string) => void;
    expect(appStateListener).toBeDefined();

    // Simulate backgrounding: real/wall-clock time passes, but iOS
    // throttles/pauses JS timers in the background, so no interval tick
    // fires -- setSystemTime moves the clock forward without running any
    // pending timers, unlike advanceTimersByTime.
    jest.setSystemTime(Date.now() + 20_000);
    await act(async () => {
      appStateListener('active');
    });
    // 20s passed while backgrounded -- reflected the instant the app
    // returns to the foreground, not after another 1s tick.
    expect(getByTestId('state').props.children).toBe('10');
  });

  it('starts the first progressive cooldown (30s) after a successful resend', async () => {
    const { getByTestId, trigger } = await renderTimer(0);

    await trigger({ success: true });

    expect(getByTestId('state').props.children).toBe('30');
  });

  it('locks with the server message on OTP_DAILY_LIMIT and stops counting down', async () => {
    const { getByTestId, trigger } = await renderTimer(0);

    await trigger({
      success: false,
      code: 'OTP_DAILY_LIMIT',
      message: 'تم تجاوز الحد الأقصى',
    });

    expect(getByTestId('state').props.children).toBe('تم تجاوز الحد الأقصى');
  });

  it('resyncs to the server-provided retryAfter on OTP_COOLDOWN', async () => {
    const { getByTestId, trigger } = await renderTimer(0);

    await trigger({
      success: false,
      code: 'OTP_COOLDOWN',
      retryAfter: 45,
      message: 'يرجى الانتظار',
    });

    expect(getByTestId('state').props.children).toBe('45');
  });
});
