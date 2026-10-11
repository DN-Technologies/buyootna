import { RefObject } from 'react';
import { TextInput, View } from 'react-native';

interface MessageTextFieldProps {
  value: string;
  onChange: (text: string) => void;
  // Typing again: the keyboard replaces the attachment panel
  onFocus: () => void;
  inputRef?: RefObject<TextInput | null>;
}

export default function MessageTextField({
  value,
  onChange,
  onFocus,
  inputRef,
}: MessageTextFieldProps) {
  return (
    <View className="mx-3 min-h-[46px] max-h-[100px] flex-1 flex-row items-center rounded-[20px] bg-[#F9FAFE] px-4">
      <TextInput
        ref={inputRef}
        className="flex-1 py-2 text-right font-cairo text-[14px] text-[#111111]"
        placeholder="اكتب رسالتك.."
        placeholderTextColor="#979797"
        multiline
        value={value}
        onChangeText={onChange}
        onFocus={onFocus}
        textAlign="right"
      />
    </View>
  );
}
