import { fireEvent, render, screen } from '@testing-library/react-native';
import * as ExpoAudio from 'expo-audio';

import VoiceMessageBubble from '@/shared/components/chat/VoiceMessageBubble';

const player = () => ({
  play: jest.fn(),
  pause: jest.fn(),
  seekTo: jest.fn(async () => {}),
  replace: jest.fn(),
});

describe('VoiceMessageBubble', () => {
  it('shows the length and plays on tap', async () => {
    const p = player();
    (ExpoAudio.useAudioPlayer as jest.Mock).mockReturnValue(p);
    await render(
      <VoiceMessageBubble uri="https://s/v.m4a" durationMs={42000} isMine timestamp="" />,
    );
    expect(screen.getByTestId('voice-duration').props.children).toBe('0:42');
    await fireEvent.press(screen.getByTestId('voice-play'));
    expect(p.play).toHaveBeenCalled();
  });

  it('starting one note pauses the one playing', async () => {
    const first = player();
    const second = player();
    (ExpoAudio.useAudioPlayer as jest.Mock)
      .mockReturnValueOnce(first)
      .mockReturnValueOnce(second);
    await render(
      <>
        <VoiceMessageBubble uri="https://s/1.m4a" isMine timestamp="" />
        <VoiceMessageBubble uri="https://s/2.m4a" isMine={false} timestamp="" />
      </>,
    );
    const [a, b] = screen.getAllByTestId('voice-play');
    await fireEvent.press(a);
    await fireEvent.press(b);
    expect(first.pause).toHaveBeenCalled();
    expect(second.play).toHaveBeenCalled();
  });

  it("can't be played while it's still sending; a failed one offers retry", async () => {
    const p = player();
    (ExpoAudio.useAudioPlayer as jest.Mock).mockReturnValue(p);
    const onRetry = jest.fn();
    await render(
      <VoiceMessageBubble uri="file:///v.m4a" isMine timestamp="" failed onRetry={onRetry} />,
    );
    await fireEvent.press(screen.getByTestId('voice-retry'));
    expect(onRetry).toHaveBeenCalled();
  });
});
