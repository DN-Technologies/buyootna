import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as ExpoAudio from 'expo-audio';

import VoiceMessageBubble from '@/shared/components/chat/VoiceMessageBubble';
import { cachedVoiceFile, keepVoiceFile } from '@/shared/utils/chatMediaCache';

jest.mock('@/shared/utils/chatMediaCache', () => ({
  cachedVoiceFile: jest.fn(async () => null),
  keepVoiceFile: jest.fn(async () => {}),
}));

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

  // QA: voice notes were fetched again every time the chat was reopened
  it('keeps its player when the server sends a newly signed link', async () => {
    const p = player();
    (ExpoAudio.useAudioPlayer as jest.Mock).mockClear().mockReturnValue(p);
    const { rerender } = await render(
      <VoiceMessageBubble uri="https://s/v.m4a?sig=1" isMine timestamp="" />,
    );
    await rerender(<VoiceMessageBubble uri="https://s/v.m4a?sig=2" isMine timestamp="" />);

    const sources = (ExpoAudio.useAudioPlayer as jest.Mock).mock.calls.map((c) => c[0]);
    expect(new Set(sources)).toEqual(new Set(['https://s/v.m4a?sig=1']));
  });

  it('plays the copy kept on the phone when there is one, without a new link', async () => {
    (keepVoiceFile as jest.Mock).mockClear();
    (cachedVoiceFile as jest.Mock).mockResolvedValueOnce('file:///cache/chat-voice-v.m4a');
    const p = player();
    (ExpoAudio.useAudioPlayer as jest.Mock).mockReturnValue(p);
    const refreshUri = jest.fn();
    await render(
      <VoiceMessageBubble uri="https://s/v.m4a?sig=1" isMine timestamp="" refreshUri={refreshUri} />,
    );
    await waitFor(() =>
      expect(p.replace).toHaveBeenCalledWith('file:///cache/chat-voice-v.m4a'),
    );

    await fireEvent.press(screen.getByTestId('voice-play'));

    expect(p.play).toHaveBeenCalled();
    expect(refreshUri).not.toHaveBeenCalled();
    expect(keepVoiceFile).not.toHaveBeenCalled();
  });

  it('keeps a note on the phone the first time it is played', async () => {
    (keepVoiceFile as jest.Mock).mockClear();
    const p = player();
    (ExpoAudio.useAudioPlayer as jest.Mock).mockReturnValue(p);
    await render(<VoiceMessageBubble uri="https://s/v.m4a?sig=1" isMine timestamp="" />);

    await fireEvent.press(screen.getByTestId('voice-play'));

    expect(keepVoiceFile).toHaveBeenCalledWith('https://s/v.m4a?sig=1');
  });
});
