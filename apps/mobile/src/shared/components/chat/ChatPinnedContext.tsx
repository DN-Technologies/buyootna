import { Text, TouchableOpacity, View } from 'react-native';

import { PinnedChevronIcon } from '@/assets/icons/chat';

interface ChatPinnedContextProps {
  testID?: string;
  title: string;
  // "السالمية • 450,000 د.ك"
  subtitle: string;
  onPress?: () => void;
}

/**
 * What the chat is about, pinned under the header (Figma 5644:297831): the
 * title and one line of details on the right, a chevron on the left.
 */
export default function ChatPinnedContext({
  testID = 'chat-pinned-context',
  title,
  subtitle,
  onPress,
}: ChatPinnedContextProps) {
  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.85}
      disabled={!onPress}
      onPress={onPress}
      className="z-0 h-[65px] flex-row items-center gap-2 border-y-[0.5px] border-[#ECECEC] bg-[#F9FAFE] px-4 py-3"
    >
      <View className="flex-1 items-start justify-center gap-1">
        <Text
          className="font-cairo-semibold text-[14px] leading-[20px] text-[#111111]"
          style={{ writingDirection: 'rtl', letterSpacing: 0.28 }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text
            className="font-cairo-medium text-[13px] leading-[17px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>

      <View className="h-8 w-8 items-center justify-center">
        <PinnedChevronIcon />
      </View>
    </TouchableOpacity>
  );
}
