import { act, cleanup, fireEvent, render } from '@testing-library/react-native';
import { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';

import { useSingleFlight } from '../useSingleFlight';

// Harness component pattern per useOtpResendTimer.spec.tsx -- renderHook()
// from this testing-library version doesn't reliably flush effects here.
// Each press starts run(task) with a task whose completion is externally
// controlled; the text shows how many times the task actually started.
function FlightHarness({
  onStarted,
}: {
  onStarted: (release: () => void) => void;
}) {
  const run = useSingleFlight();
  const [started, setStarted] = useState(0);

  return (
    <>
      <Text testID="started">{String(started)}</Text>
      <TouchableOpacity
        testID="tap"
        onPress={() => {
          run(
            () =>
              new Promise<void>((resolve) => {
                setStarted((n) => n + 1);
                onStarted(resolve);
              }),
          );
        }}
      >
        <Text>tap</Text>
      </TouchableOpacity>
    </>
  );
}

async function renderHarness() {
  let release: (() => void) | null = null;
  const utils = await render(
    <FlightHarness onStarted={(r) => (release = r)} />,
  );
  const tap = () =>
    act(async () => {
      fireEvent.press(utils.getByTestId('tap'));
    });
  const settle = () =>
    act(async () => {
      release?.();
    });
  return { ...utils, tap, settle, startedText: () => utils.getByTestId('started') };
}

describe('useSingleFlight', () => {
  afterEach(() => {
    cleanup();
  });

  it('ignores additional taps while a task is in flight', async () => {
    const h = await renderHarness();

    await h.tap();
    await h.tap();
    await h.tap();

    expect(h.startedText().props.children).toBe('1');
    await h.settle();
  });

  it('allows a new task once the previous one settles', async () => {
    const h = await renderHarness();

    await h.tap();
    await h.settle();
    await h.tap();

    expect(h.startedText().props.children).toBe('2');
    await h.settle();
  });

  it('releases the guard even when the task rejects', async () => {
    function RejectHarness() {
      const run = useSingleFlight();
      const [attempts, setAttempts] = useState(0);
      return (
        <>
          <Text testID="started">{String(attempts)}</Text>
          <TouchableOpacity
            testID="tap"
            onPress={() => {
              setAttempts((n) => n + 1);
              run(() => Promise.reject(new Error('boom'))).catch(() => {});
            }}
          >
            <Text>tap</Text>
          </TouchableOpacity>
        </>
      );
    }

    const utils = await render(<RejectHarness />);
    const press = () =>
      act(async () => {
        fireEvent.press(utils.getByTestId('tap'));
      });

    await press();
    await press();

    // Second press ran too -- the rejection did not wedge the guard shut.
    expect(utils.getByTestId('started').props.children).toBe('2');
  });
});
