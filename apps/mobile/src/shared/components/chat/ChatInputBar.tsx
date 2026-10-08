import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  LayoutAnimation,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LocalAttachment } from '@/shared/api/chat.service';
import AttachmentPanel from '@/shared/components/chat/AttachmentPanel';
import { useKeyboardHeight } from '@/shared/hooks/useKeyboardHeight';

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

      {/* Text Input pill */}
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

      {/* Send Button */}
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
          className='relative -top-1'
        />
      </TouchableOpacity>
    </View>
    {showAttachmentMenu && (
      <AttachmentPanel
        height={panelHeight}
        onPicked={onPickedFiles}
        onClose={() => setShowAttachmentMenu(false)}
      />
    )}
    </View>
  );
}
