import { useRef } from 'react';
import {
  Keyboard,
  LayoutAnimation,
  Platform,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LocalAttachment } from '@/shared/api/chat.service';
import AttachmentPanel, {
  ChatComposer,
} from '@/shared/components/chat/AttachmentPanel';
import { useKeyboardHeight } from '@/shared/hooks/device/useKeyboardHeight';

import AttachToggleButton from './input-bar/AttachToggleButton';
import { DEFAULT_PANEL_HEIGHT } from './input-bar/constants';
import MessageTextField from './input-bar/MessageTextField';
import SendButton from './input-bar/SendButton';
import { useIosKeyboardInset } from './input-bar/useIosKeyboardInset';
import { useVoiceNote } from './input-bar/useVoiceNote';
import VoiceButton from './input-bar/VoiceButton';
import VoiceRecordingRow from './input-bar/VoiceRecordingRow';

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
  const iosKeyboardHeight = useIosKeyboardInset();
  const voice = useVoiceNote(onSendVoice, inputText);

  // The panel takes the keyboard's place at the keyboard's last height
  const keyboardHeight = useKeyboardHeight();
  const lastKeyboardHeight = useRef(0);
  if (keyboardHeight > 0) lastKeyboardHeight.current = keyboardHeight;
  const panelHeight =
    lastKeyboardHeight.current || DEFAULT_PANEL_HEIGHT + insets.bottom;

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

  return (
    <View className="bg-white">
      <View
        testID="chat-input-row"
        className="relative z-50 flex-row items-end bg-white px-4 pt-2.5"
        style={{
          // The parent screen no longer applies KeyboardAvoidingView's
          // 'padding' behavior on iOS (see chat/[id].tsx) -- the directly
          // measured keyboard height is the sole source of bottom spacing
          // there now.
          // Android: the app draws edge to edge (edgeToEdgeEnabled), and
          // then adjustResize no longer shrinks the window, so the keyboard
          // covered the field (QA, Galaxy A36). The bar lifts itself by the
          // keyboard height too; React Native reports it without the
          // navigation bar (ime - systemBars), which the safe-area inset
          // adds back.
          // +8: sitting exactly flush against the keyboard read as visually
          // cramped -- a small breathing-room gap looks right without
          // re-exposing the predictive bar this was fixed for.
          paddingBottom: showAttachmentMenu
            ? 10
            : Platform.OS === 'ios' && iosKeyboardHeight > 0
              ? iosKeyboardHeight + 8
              : Platform.OS === 'android' && keyboardHeight > 0
                ? keyboardHeight + insets.bottom + 8
                : Math.max(insets.bottom, 12),
          shadowColor: '#ABACBC',
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
          elevation: 6,
        }}
      >
        <AttachToggleButton
          panelOpen={showAttachmentMenu}
          onPress={togglePanel}
        />

        {voice.isRecording ? (
          <VoiceRecordingRow
            elapsedMs={voice.elapsedMs}
            locked={voice.locked}
            cancelling={voice.cancelling}
            onDelete={() => voice.finish(false)}
          />
        ) : (
          <MessageTextField
            value={inputText}
            onChange={onInputChange}
            inputRef={inputRef}
            onFocus={() => showAttachmentMenu && setShowAttachmentMenu(false)}
          />
        )}

        {voice.showMic ? (
          <VoiceButton
            isRecording={voice.isRecording}
            locked={voice.locked}
            disabled={sendDisabled}
            {...voice.pressHandlers}
          />
        ) : (
          <SendButton
            hasText={!!inputText.trim()}
            disabled={sendDisabled}
            onPress={onSend}
          />
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
