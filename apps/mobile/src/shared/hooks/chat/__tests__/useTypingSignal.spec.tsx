import { act, render } from '@testing-library/react-native';

import { socketService } from '@/shared/services/socket.service';

import { useTypingSignal } from '../useTypingSignal';

jest.mock('@/shared/services/socket.service', () => ({
  socketService: { emitTyping: jest.fn() },
}));

describe('useTypingSignal', () => {
  const emit = socketService.emitTyping as jest.Mock;
  const Probe = ({ draft }: { draft: string }) => {
    useTypingSignal('c1', draft);
    return null;
  };

  beforeEach(() => emit.mockClear());
  afterEach(() => jest.useRealTimers());

  it('says typing once while the draft grows, and stopped when it is sent', async () => {
    const { rerender } = await render(<Probe draft="" />);
    expect(emit).not.toHaveBeenCalled();

    await rerender(<Probe draft="م" />);
    await rerender(<Probe draft="مر" />);
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenLastCalledWith('c1', true);

    await rerender(<Probe draft="" />);
    expect(emit).toHaveBeenLastCalledWith('c1', false);
  });

  it('says stopped when the chat closes mid-typing', async () => {
    const { unmount } = await render(<Probe draft="مرحبا" />);
    expect(emit).toHaveBeenLastCalledWith('c1', true);

    await unmount();
    expect(emit).toHaveBeenLastCalledWith('c1', false);
  });

  it('says stopped after a pause in typing', async () => {
    jest.useFakeTimers();
    await render(<Probe draft="مرحبا" />);
    expect(emit).toHaveBeenLastCalledWith('c1', true);

    act(() => jest.advanceTimersByTime(5000));
    expect(emit).toHaveBeenLastCalledWith('c1', false);
  });
});
