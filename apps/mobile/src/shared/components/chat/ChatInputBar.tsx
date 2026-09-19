import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  LayoutAnimation,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChatInputBarProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
  showAttachmentMenu: boolean;
  setShowAttachmentMenu: (show: boolean) => void;
  onAttachImage: () => void;
}

export default function ChatInputBar({
  inputText,
  onInputChange,
  onSend,
  showAttachmentMenu,
  setShowAttachmentMenu,
  onAttachImage,
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
        paddingBottom:
          Platform.OS === 'ios' && iosKeyboardHeight > 0
            ? iosKeyboardHeight + 8
            : Math.max(insets.bottom, 12),
        shadowColor: '#ABACBC',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -2 },
        elevation: 6,
      }}
    >
      {/* Attachment Button & Menu */}
      <View className="relative">
        {showAttachmentMenu && (
          <View className="absolute bottom-full left-[2px] mb-2 w-48 rounded-xl bg-white shadow-md shadow-gray-200">
            <TouchableOpacity
              className="px-4 py-2"
              onPress={() => {
                onAttachImage();
                setShowAttachmentMenu(false);
              }}
            >
              <Text
                className="font-cairo text-sm leading-[22px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                ارفاق صورة
              </Text>
            </TouchableOpacity>

            {/* Pointer / Triangle */}
            <View className="absolute -bottom-1.5 left-4 -z-10 h-4 w-4 rotate-45 rounded-sm bg-white shadow-md shadow-gray-200" />
          </View>
        )}

        <TouchableOpacity
          className="h-8 w-8 items-center justify-center"
          onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
        >
          <Feather name="plus" size={24} color="#111111" />
        </TouchableOpacity>
      </View>

      {/* Text Input pill */}
      <View className="mx-3 min-h-[46px] max-h-[100px] flex-1 flex-row items-center rounded-[20px] bg-[#F9FAFE] px-4">
        <TextInput
          className="flex-1 py-2 text-right font-cairo text-[14px] text-[#111111]"
          placeholder="اكتب رسالتك.."
          placeholderTextColor="#979797"
          multiline
          value={inputText}
          onChangeText={onInputChange}
          textAlign="right"
        />
      </View>

      {/* Send Button */}
      <TouchableOpacity
        testID="chat-send-button"
        onPress={onSend}
        className="h-8 w-8 items-center justify-center"
      >
        <Feather
          name="send"
          size={24}
          color={inputText.trim() ? '#15304D' : '#94A3B8'}
        />
      </TouchableOpacity>
    </View>
  );
}
