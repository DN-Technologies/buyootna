import { act, fireEvent, render } from '@testing-library/react-native';

import type { PulseItem } from '@/shared/api/pulse.service';

import PulseNotch, { PULSE_CYCLE_MS } from '../PulseNotch';

jest.mock('expo-image', () => ({ Image: 'Image' }));

const items: PulseItem[] = [
  { kind: 'requestOffers', count: 2, refId: null, tone: 'gold' },
  { kind: 'adExpiring', count: 1, refId: 'p1', daysLeft: 1, tone: 'amber' },
];

describe('PulseNotch', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows each item in turn', async () => {
    const screen = await render(<PulseNotch items={items} onPress={jest.fn()} />);
    expect(screen.getByTestId('pulse-notch-requestOffers')).toHaveTextContent(/\+2$/);
    await act(() => jest.advanceTimersByTime(PULSE_CYCLE_MS));
    expect(screen.getByTestId('pulse-notch-adExpiring')).toHaveTextContent(/1$/);
    await act(() => jest.advanceTimersByTime(PULSE_CYCLE_MS));
    expect(screen.getByTestId('pulse-notch-requestOffers')).toBeTruthy();
  });

  it('stays on one item while paused', async () => {
    const screen = await render(<PulseNotch items={items} paused onPress={jest.fn()} />);
    await act(() => jest.advanceTimersByTime(PULSE_CYCLE_MS * 3));
    expect(screen.getByTestId('pulse-notch-requestOffers')).toBeTruthy();
  });

  it('a story shows its author, and a tap opens the quick view', async () => {
    const onPress = jest.fn();
    const screen = await render(
      <PulseNotch
        items={[{ kind: 'providerStory', count: 1, refId: 'c1', avatarUrl: 'logo.png', tone: 'gold' }]}
        onPress={onPress}
      />,
    );
    expect(screen.getByTestId('pulse-notch-providerStory')).toBeTruthy();
    expect(screen.getByLabelText('قصة جديدة من مفضلتك')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('pulse-notch'));
    expect(onPress).toHaveBeenCalled();
  });
});
