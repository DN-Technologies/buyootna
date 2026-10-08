import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ChatSearchBarProps {
  query: string;
  onChangeQuery: (q: string) => void;
  position: number;
  total: number;
  isSearching: boolean;
  onOlder: () => void;
  onNewer: () => void;
  onClose: () => void;
}

/** Under the chat header: search this chat, "2 / 7", ↑ older / ↓ newer. */
export default function ChatSearchBar({
  query,
  onChangeQuery,
  position,
  total,
  isSearching,
  onOlder,
  onNewer,
  onClose,
}: ChatSearchBarProps) {
  const hasQuery = query.trim().length > 0;
  return (
    <View
      testID="chat-search-bar"
      className="flex-row items-center gap-2 border-b border-[#ECECEC] bg-white px-4 py-2"
    >
      <View className="flex-1 flex-row items-center rounded-xl bg-[#F9FAFE] px-3">
        <Feather name="search" size={16} color="#94A3B8" />
        <TextInput
          testID="chat-search-input"
          autoFocus
          value={query}
          onChangeText={onChangeQuery}
          placeholder="ابحث في المحادثة..."
          placeholderTextColor="#94A3B8"
          returnKeyType="search"
          className="flex-1 px-2 py-2 text-right font-cairo text-[14px] text-[#111111]"
        />
        {isSearching ? (
          <ActivityIndicator size="small" color="#94A3B8" />
        ) : (
          hasQuery && (
            <Text testID="chat-search-count" className="font-cairo text-[12px] text-[#6B6A6A]">
              {total ? `${position} / ${total}` : 'لا نتائج'}
            </Text>
          )
        )}
      </View>
      <TouchableOpacity
        testID="chat-search-older"
        accessibilityLabel="الأقدم"
        disabled={!total || position >= total}
        onPress={onOlder}
        className="p-1"
      >
        <Feather name="chevron-up" size={22} color={total && position < total ? '#15304D' : '#CBD5E1'} />
      </TouchableOpacity>
      <TouchableOpacity
        testID="chat-search-newer"
        accessibilityLabel="الأحدث"
        disabled={position <= 1}
        onPress={onNewer}
        className="p-1"
      >
        <Feather name="chevron-down" size={22} color={position > 1 ? '#15304D' : '#CBD5E1'} />
      </TouchableOpacity>
      <TouchableOpacity testID="chat-search-close" accessibilityLabel="إغلاق البحث" onPress={onClose} className="p-1">
        <Feather name="x" size={20} color="#64748B" />
      </TouchableOpacity>
    </View>
  );
}
