import { Feather } from '@expo/vector-icons';
import { GestureResponderEvent, Pressable } from 'react-native';

interface VoiceButtonProps {
  isRecording: boolean;
  locked: boolean;
  disabled: boolean;
  onPressIn: (e: { nativeEvent: { pageX: number } }) => void;
  onTouchMove: (e: GestureResponderEvent) => void;
  onPressOut: () => void;
}

/**
 * Hold to record and release to send; a quick tap keeps recording (send /
 * delete buttons); sliding away while holding cancels.
 */
export default function VoiceButton({
  isRecording,
  locked,
  disabled,
  onPressIn,
  onTouchMove,
  onPressOut,
}: VoiceButtonProps) {
  return (
    <Pressable
      testID="chat-voice-button"
      accessibilityLabel={locked ? 'إرسال الرسالة الصوتية' : 'تسجيل رسالة صوتية'}
      disabled={disabled}
      onPressIn={onPressIn}
      onTouchMove={onTouchMove}
      onPressOut={onPressOut}
      className="h-8 w-8 items-center justify-center"
    >
      <Feather
        name={locked ? 'send' : 'mic'}
        size={24}
        color={isRecording ? '#DC2626' : '#15304D'}
        className="relative -top-1"
      />
    </Pressable>
  );
}
