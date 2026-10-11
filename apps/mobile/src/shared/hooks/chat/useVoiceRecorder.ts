import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

import { LocalAttachment } from '@/shared/api/chat.service';
import { showAlert } from '@/shared/utils/alert';
import { VOICE_MAX_MS } from '@/shared/utils/chatAttachments';

// Shorter than this is a slip of the finger, not a message
const MIN_VOICE_MS = 1000;

/**
 * Records a voice note (AAC .m4a, up to 5 minutes). `stop(true)` hands the
 * recording to `onRecorded`; `stop(false)` throws it away.
 */
export function useVoiceRecorder(onRecorded: (voice: LocalAttachment) => void) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder, 200);
  const [isRecording, setIsRecording] = useState(false);
  // A release that arrives while the recorder is still starting
  const pendingStop = useRef<boolean | null>(null);
  const starting = useRef(false);

  const stop = useCallback(
    async (send: boolean) => {
      if (starting.current) {
        pendingStop.current = send;
        return;
      }
      if (!isRecording) return;
      const durationMs = state.durationMillis;
      setIsRecording(false);
      try {
        await recorder.stop();
        await setAudioModeAsync({ allowsRecording: false });
      } catch (error) {
        console.error('Stopping the recording failed:', error);
      }
      const uri = recorder.uri;
      if (send && uri && durationMs >= MIN_VOICE_MS) {
        onRecorded({
          uri,
          name: `voice-${Date.now()}.m4a`,
          mimeType: 'audio/m4a',
          kind: 'AUDIO',
          durationMs,
        });
      }
    },
    [isRecording, onRecorded, recorder, state.durationMillis],
  );

  const start = useCallback(async () => {
    if (isRecording || starting.current) return;
    starting.current = true;
    pendingStop.current = null;
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        showAlert(
          'الإذن مطلوب',
          'يرجى السماح باستخدام الميكروفون من الإعدادات لتسجيل رسالة صوتية.',
        );
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
    } catch (error) {
      console.error('Starting the recording failed:', error);
      showAlert('خطأ', 'تعذر بدء التسجيل، حاول مرة أخرى');
    } finally {
      starting.current = false;
    }
  }, [isRecording, recorder]);

  // Released before recording had started: nothing worth sending
  useEffect(() => {
    if (isRecording && pendingStop.current !== null) {
      pendingStop.current = null;
      void stop(false);
    }
  }, [isRecording, stop]);

  // The 5-minute limit sends what was recorded
  useEffect(() => {
    if (isRecording && state.durationMillis >= VOICE_MAX_MS) void stop(true);
  }, [isRecording, state.durationMillis, stop]);

  return {
    isRecording,
    elapsedMs: isRecording ? state.durationMillis : 0,
    start,
    stop,
  };
}
