import { useRef, useState } from 'react';
import type { GestureResponderEvent } from 'react-native';

import type { LocalAttachment } from '@/shared/api/chat.service';
import { useVoiceRecorder } from '@/shared/hooks/chat/useVoiceRecorder';

import { CANCEL_SLIDE_PX, LOCK_TAP_MS } from './constants';

const noop = () => {};

interface PressEvent {
  nativeEvent: { pageX: number };
}

/**
 * The mic button's behaviour: hold to record and release to send; a quick
 * tap keeps recording (send / delete buttons appear); sliding away while
 * holding cancels. Without `onSendVoice` there is no mic at all.
 */
export function useVoiceNote(
  onSendVoice: ((voice: LocalAttachment) => void) | undefined,
  inputText: string,
) {
  const voice = useVoiceRecorder(onSendVoice ?? noop);
  const [locked, setLocked] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const pressStart = useRef<{ at: number; x: number } | null>(null);

  // The mic shows instead of "send" while there's no text
  const showMic = !!onSendVoice && (voice.isRecording || !inputText.trim());

  const finish = (send: boolean) => {
    setLocked(false);
    setCancelling(false);
    void voice.stop(send);
  };

  const onPressIn = (e: PressEvent) => {
    if (locked) return;
    pressStart.current = { at: Date.now(), x: e.nativeEvent.pageX };
    setCancelling(false);
    void voice.start();
  };

  const onTouchMove = (e: GestureResponderEvent) => {
    if (locked || !pressStart.current) return;
    setCancelling(
      Math.abs(e.nativeEvent.pageX - pressStart.current.x) > CANCEL_SLIDE_PX,
    );
  };

  const onPressOut = () => {
    if (locked) {
      finish(true);
      return;
    }
    const heldMs = Date.now() - (pressStart.current?.at ?? 0);
    pressStart.current = null;
    if (cancelling) finish(false);
    else if (heldMs < LOCK_TAP_MS) setLocked(true);
    else finish(true);
  };

  return {
    isRecording: voice.isRecording,
    elapsedMs: voice.elapsedMs,
    showMic,
    locked,
    cancelling,
    finish,
    pressHandlers: { onPressIn, onTouchMove, onPressOut },
  };
}
