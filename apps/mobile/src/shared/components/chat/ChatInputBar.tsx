import { Feather } from '@expo/vector-icons';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  return (
    <View className="relative z-50 flex-row items-end border-t border-gray-100 bg-white px-5 py-3">
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
          className="h-[44px] w-[44px] items-center justify-center"
          onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
        >
          <Feather name="plus" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Text Input */}
      <View className="mx-3 max-h-[100px] min-h-[44px] flex-1 flex-row items-center rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2">
        <TextInput
          className="flex-1 text-right font-cairo-medium text-[14px] leading-[22px] text-[#111111]"
          placeholder="اكتب رسالتك.."
          placeholderTextColor="#94A3B8"
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
        className={`h-[40px] w-[40px] items-center justify-center rounded-full ${inputText.trim() ? 'bg-[#15304D]' : 'bg-gray-100'}`}
      >
        <Feather
          name="send"
          size={18}
          color={inputText.trim() ? 'white' : '#94A3B8'}
        />
      </TouchableOpacity>
    </View>
  );
}
