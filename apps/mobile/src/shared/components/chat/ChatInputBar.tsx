import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LocalAttachment } from '@/shared/api/chat.service';
import AttachmentPanel, {
  ChatComposer,
} from '@/shared/components/chat/AttachmentPanel';
import { useKeyboardHeight } from '@/shared/hooks/device/useKeyboardHeight';
import { useVoiceRecorder } from '@/shared/hooks/chat/useVoiceRecorder';
import { formatDuration } from '@/shared/utils/chatAttachments';

// A press shorter than this locks recording (send / delete buttons)
const LOCK_TAP_MS = 500;
// Sliding this far while holding cancels the recording
const CANCEL_SLIDE_PX = 80;
const noop = () => {};

// Before the keyboard has been opened once, the panel uses this height
const DEFAULT_PANEL_HEIGHT = 260;

interface ChatInputBarProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
  showAttachmentMenu: boolean;
  setShowAttachmentMenu: (show: boolean) => void;
  // Files picked from the attachment panel, to review before sending
  onPickedFiles: (files: LocalAttachment[]) => void;
  // عقار / الموقع / موعد معاينة / عرض سعر
  onCompose?: (composer: ChatComposer) => void;
  // 🎤 a recorded voice note; without it the mic isn't shown
  onSendVoice?: (voice: LocalAttachment) => void;
  // While the conversation is still being created
  sendDisabled?: boolean;
  // Lets the screen focus the input (e.g. after choosing رد)
  inputRef?: React.RefObject<TextInput | null>;
}

export default function ChatInputBar({
  inputText,
  onInputChange,
  onSend,
  showAttachmentMenu,
  setShowAttachmentMenu,
  onPickedFiles,
  onCompose,
  onSendVoice,
  sendDisabled = false,
  inputRef,
}: ChatInputBarProps) {
  const insets = useSafeAreaInsets();

  // iOS-only: track the keyboard's real, final rendered height ourselves
  // instead of relying on the parent screen's KeyboardAvoidingView
  // ('padding' behavior) to compute it. Confirmed live (screenshot) that
  // that calculation under-counts the keyboard's predictive-text/QuickType
  // suggestion bar -- an accessory view that can settle its own size
  // slightly after the main keyboard frame animates in -- leaving this
  // bar's bottom edge rendered behind it. keyboardDidShow fires only once
  // the keyboard (accessory bar included) has fully settled, so its
  // endCoordinates.height is the true final figure. keyboardWillShow is
  // used only to kick off a synced LayoutAnimation so the resize still
  // tracks the keyboard's own slide-up instead of jump-cutting at the end.
  // Android is untouched: AndroidManifest's windowSoftInputMode
  // "adjustResize" already resizes the window natively, no JS tracking
  // needed there.
  const [iosKeyboardHeight, setIosKeyboardHeight] = useState(0);
  // The panel takes the keyboard's place at the keyboard's last height
  const keyboardHeight = useKeyboardHeight();
  const lastKeyboardHeight = useRef(0);
  if (keyboardHeight > 0) lastKeyboardHeight.current = keyboardHeight;
  const panelHeight =
    lastKeyboardHeight.current || DEFAULT_PANEL_HEIGHT + insets.bottom;

  // Voice notes: the mic shows instead of "send" while there's no text
  const voice = useVoiceRecorder(onSendVoice ?? noop);
  const [voiceLocked, setVoiceLocked] = useState(false);
  const [voiceCancel, setVoiceCancel] = useState(false);
  const pressStart = useRef<{ at: number; x: number } | null>(null);
  const showMic = !!onSendVoice && (voice.isRecording || !inputText.trim());
  const finishVoice = (send: boolean) => {
    setVoiceLocked(false);
    setVoiceCancel(false);
    void voice.stop(send);
  };

  const togglePanel = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (showAttachmentMenu) {
      setShowAttachmentMenu(false);
      inputRef?.current?.focus();
    } else {
      setShowAttachmentMenu(true);
      Keyboard.dismiss();
    }
  };
  const animationConfiguredRef = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const configureAnimation = (durationMs?: number) => {
      LayoutAnimation.configureNext(
        durationMs
          ? {
              duration: durationMs,
              update: { type: LayoutAnimation.Types.keyboard },
            }
          : LayoutAnimation.Presets.easeInEaseOut,
      );
      animationConfiguredRef.current = true;
    };

    const willShowSub = Keyboard.addListener('keyboardWillShow', (e) => {
      configureAnimation(e.duration);
      setIosKeyboardHeight(e.endCoordinates.height);
    });
    const didShowSub = Keyboard.addListener('keyboardDidShow', (e) => {
      // Corrective snap in case the settled height differs from the
      // "will" estimate (the predictive bar case) -- only animate this
      // one if keyboardWillShow didn't already fire first.
      if (!animationConfiguredRef.current) configureAnimation();
      setIosKeyboardHeight(e.endCoordinates.height);
      animationConfiguredRef.current = false;
    });
    const willHideSub = Keyboard.addListener('keyboardWillHide', (e) => {
      configureAnimation(e.duration);
      setIosKeyboardHeight(0);
    });

    return () => {
      willShowSub.remove();
      didShowSub.remove();
      willHideSub.remove();
    };
  }, []);

  return (
    <View className="bg-white">
    <View
      className="relative z-50 flex-row items-end bg-white px-4 pt-2.5"
      style={{
        // The parent screen no longer applies KeyboardAvoidingView's
        // 'padding' behavior on iOS (see chat/[id].tsx) -- this bar's own
        // directly-measured keyboard height is the sole source of bottom
        // spacing there now. Android still relies on adjustResize, so it
        // keeps using the static home-indicator inset unconditionally.
        // +8 on iOS: sitting exactly flush against the keyboard (zero gap)
        // read as visually cramped -- a small breathing-room gap looks
        // right without being large enough to re-expose the predictive
        // bar this was fixed for.
        paddingBottom: showAttachmentMenu
          ? 10
          : Platform.OS === 'ios' && iosKeyboardHeight > 0
            ? iosKeyboardHeight + 8
            : Math.max(insets.bottom, 12),
        shadowColor: '#ABACBC',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -2 },
        elevation: 6,
      }}
    >
      {/* "+" swaps the keyboard for the attachment panel (and back) */}
      <TouchableOpacity
        testID="chat-attach-button"
        accessibilityLabel={showAttachmentMenu ? 'لوحة المفاتيح' : 'إرفاق'}
        className="h-8 w-8 items-center justify-center"
        onPress={togglePanel}
      >
        <Feather
          name={showAttachmentMenu ? 'type' : 'plus'}
          size={showAttachmentMenu ? 20 : 24}
          color="#111111"
          className="relative -top-2.5"
        />
      </TouchableOpacity>

      {voice.isRecording ? (
        // Recording: timer, and (locked) delete instead of the text field
        <View
          testID="voice-recording-row"
          className="mx-3 min-h-[46px] flex-1 flex-row items-center justify-between rounded-[20px] bg-[#FEF2F2] px-4"
        >
          <View className="flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
            <Text testID="voice-timer" className="font-cairo-semibold text-[14px] text-[#111111]">
              {formatDuration(voice.elapsedMs)}
            </Text>
          </View>
          {voiceLocked ? (
            <TouchableOpacity
              testID="voice-cancel"
              accessibilityLabel="حذف التسجيل"
              onPress={() => finishVoice(false)}
              className="p-1"
            >
              <Feather name="trash-2" size={18} color="#DC2626" />
            </TouchableOpacity>
          ) : (
            <Text className="font-cairo text-[12px] text-[#6B6A6A]">
              {voiceCancel ? 'ارفع إصبعك للإلغاء' : 'اسحب للإلغاء'}
            </Text>
          )}
        </View>
      ) : (
        <View className="mx-3 min-h-[46px] max-h-[100px] flex-1 flex-row items-center rounded-[20px] bg-[#F9FAFE] px-4">
          <TextInput
            ref={inputRef}
            className="flex-1 py-2 text-right font-cairo text-[14px] text-[#111111]"
            placeholder="اكتب رسالتك.."
            placeholderTextColor="#979797"
            multiline
            value={inputText}
            onChangeText={onInputChange}
            // Typing again: the keyboard replaces the panel
            onFocus={() => showAttachmentMenu && setShowAttachmentMenu(false)}
            textAlign="right"
          />
        </View>
      )}

      {showMic ? (
        // Hold to record and release to send; a quick tap keeps recording
        // (send / delete buttons); sliding away while holding cancels
        <Pressable
          testID="chat-voice-button"
          accessibilityLabel={voiceLocked ? 'إرسال الرسالة الصوتية' : 'تسجيل رسالة صوتية'}
          disabled={sendDisabled}
          onPressIn={(e) => {
            if (voiceLocked) return;
            pressStart.current = { at: Date.now(), x: e.nativeEvent.pageX };
            setVoiceCancel(false);
            void voice.start();
          }}
          onTouchMove={(e) => {
            if (voiceLocked || !pressStart.current) return;
            setVoiceCancel(
              Math.abs(e.nativeEvent.pageX - pressStart.current.x) > CANCEL_SLIDE_PX,
            );
          }}
          onPressOut={() => {
            if (voiceLocked) {
              finishVoice(true);
              return;
            }
            const heldMs = Date.now() - (pressStart.current?.at ?? 0);
            pressStart.current = null;
            if (voiceCancel) finishVoice(false);
            else if (heldMs < LOCK_TAP_MS) setVoiceLocked(true);
            else finishVoice(true);
          }}
          className="h-8 w-8 items-center justify-center"
        >
          <Feather
            name={voiceLocked ? 'send' : 'mic'}
            size={24}
            color={voice.isRecording ? '#DC2626' : '#15304D'}
            className="relative -top-1"
          />
        </Pressable>
      ) : (
        <TouchableOpacity
          testID="chat-send-button"
          onPress={onSend}
          disabled={sendDisabled}
          className="h-8 w-8 items-center justify-center"
        >
          <Feather
            name="send"
            size={24}
            color={inputText.trim() && !sendDisabled ? '#15304D' : '#94A3B8'}
            className="relative -top-1"
          />
        </TouchableOpacity>
      )}
    </View>
    {showAttachmentMenu && (
      <AttachmentPanel
        height={panelHeight}
        onPicked={onPickedFiles}
        onCompose={onCompose}
        onClose={() => setShowAttachmentMenu(false)}
      />
    )}
    </View>
  );
}
