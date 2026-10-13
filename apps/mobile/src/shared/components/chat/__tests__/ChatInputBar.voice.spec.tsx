import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as ExpoAudio from 'expo-audio';

import ChatInputBar from '@/shared/components/chat/ChatInputBar';
import { useAlertStore } from '@/shared/store/useAlertStore';

jest.mock('@/shared/utils/chatAttachments', () => ({
  ...jest.requireActual('@/shared/utils/chatAttachments'),
  pickPhotos: jest.fn(),
  takePhoto: jest.fn(),
  pickDocuments: jest.fn(),
  pickVideo: jest.fn(),
}));

const recorder = {
  prepareToRecordAsync: jest.fn(async () => {}),
  record: jest.fn(),
  stop: jest.fn(async () => {}),
  uri: 'file:///voice.m4a',
};
const setElapsed = (ms: number) =>
  (ExpoAudio.useAudioRecorderState as jest.Mock).mockReturnValue({ durationMillis: ms });

const setup = async (props: Partial<Parameters<typeof ChatInputBar>[0]> = {}) => {
  const onSendVoice = jest.fn();
  const utils = await render(
    <ChatInputBar
      inputText=""
      onInputChange={jest.fn()}
      onSend={jest.fn()}
      showAttachmentMenu={false}
      setShowAttachmentMenu={jest.fn()}
      onPickedFiles={jest.fn()}
      onSendVoice={onSendVoice}
      {...props}
    />,
  );
  return { ...utils, onSendVoice };
};
const press = (x = 0) => ({ nativeEvent: { pageX: x } });

describe('ChatInputBar — voice notes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ExpoAudio.useAudioRecorder as jest.Mock).mockReturnValue(recorder);
    setElapsed(0);
  });

  it('shows the mic only while there is no text', async () => {
    const { rerender } = await setup();
    expect(screen.getByTestId('chat-voice-button')).toBeTruthy();
    expect(screen.queryByTestId('chat-send-button')).toBeNull();

    await rerender(
      <ChatInputBar
        inputText="مرحبا"
        onInputChange={jest.fn()}
        onSend={jest.fn()}
        showAttachmentMenu={false}
        setShowAttachmentMenu={jest.fn()}
        onPickedFiles={jest.fn()}
        onSendVoice={jest.fn()}
      />,
    );
    expect(screen.getByTestId('chat-send-button')).toBeTruthy();
  });

  it('hold to record, release to send', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1000);
    const { onSendVoice, rerender } = await setup();
    await act(async () => {
      fireEvent(screen.getByTestId('chat-voice-button'), 'pressIn', press());
    });
    expect(recorder.record).toHaveBeenCalled();
    expect(screen.getByTestId('voice-recording-row')).toBeTruthy();

    // The recorder reports its progress (a re-render, as on a device)
    setElapsed(4200);
    (Date.now as jest.Mock).mockReturnValue(5200);
    await rerender(
      <ChatInputBar
        inputText=""
        onInputChange={jest.fn()}
        onSend={jest.fn()}
        showAttachmentMenu={false}
        setShowAttachmentMenu={jest.fn()}
        onPickedFiles={jest.fn()}
        onSendVoice={onSendVoice}
      />,
    );
    expect(screen.getByTestId('voice-timer').props.children).toBe('0:04');
    await act(async () => {
      fireEvent(screen.getByTestId('chat-voice-button'), 'pressOut', press());
    });

    expect(recorder.stop).toHaveBeenCalled();
    expect(onSendVoice).toHaveBeenCalledWith(
      expect.objectContaining({
        uri: 'file:///voice.m4a',
        kind: 'AUDIO',
        mimeType: 'audio/m4a',
        durationMs: 4200,
      }),
    );
    jest.restoreAllMocks();
  });

  it('sliding away while holding cancels', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1000);
    const { onSendVoice } = await setup();
    await act(async () => {
      fireEvent(screen.getByTestId('chat-voice-button'), 'pressIn', press(300));
    });
    setElapsed(3000);
    (Date.now as jest.Mock).mockReturnValue(4000);
    await act(async () => {
      fireEvent(screen.getByTestId('chat-voice-button'), 'touchMove', press(150));
    });
    await act(async () => {
      fireEvent(screen.getByTestId('chat-voice-button'), 'pressOut', press(150));
    });
    expect(recorder.stop).toHaveBeenCalled();
    expect(onSendVoice).not.toHaveBeenCalled();
    jest.restoreAllMocks();
  });

  it('a quick tap locks recording: delete throws it away', async () => {
    const { onSendVoice } = await setup();
    await act(async () => {
      fireEvent(screen.getByTestId('chat-voice-button'), 'pressIn', press());
    });
    await act(async () => {
      fireEvent(screen.getByTestId('chat-voice-button'), 'pressOut', press());
    });
    // Still recording, with a delete button
    expect(recorder.stop).not.toHaveBeenCalled();
    setElapsed(5000);
    await act(async () => {
      fireEvent.press(screen.getByTestId('voice-cancel'));
    });
    expect(recorder.stop).toHaveBeenCalled();
    expect(onSendVoice).not.toHaveBeenCalled();
  });

  it('asks for the microphone and does not record without it', async () => {
    (ExpoAudio.requestRecordingPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      granted: false,
    });
    await setup();
    await act(async () => {
      fireEvent(screen.getByTestId('chat-voice-button'), 'pressIn', press());
    });
    expect(recorder.record).not.toHaveBeenCalled();
    expect(screen.queryByTestId('voice-recording-row')).toBeNull();
    // ...and says so, with a way to the settings
    const alert = useAlertStore.getState();
    expect(alert.visible).toBe(true);
    expect(alert.message).toContain('الميكروفون');
    expect(alert.buttons[0].text).toBe('فتح الإعدادات');
  });
});
