import { Image } from 'expo-image';
import { Keyboard, TextInput, TouchableOpacity, View } from 'react-native';

import type { InboxTab } from './inboxRow';
import InboxTabs from './InboxTabs';

interface InboxToolbarProps {
  activeTab: InboxTab;
  onTabChange: (tab: InboxTab) => void;
  isSearching: boolean;
  onSearchingChange: (searching: boolean) => void;
  query: string;
  onQueryChange: (query: string) => void;
}

/**
 * Under the title (RTL): 🔍 on the right, the tabs pill or the search field,
 * then «+» or ✕ on the left. «+» or 🔍 opens the field; ✕ clears it and
 * brings the tabs back (Figma 9191:26630 / 9191:32180).
 */
export default function InboxToolbar({
  activeTab,
  onTabChange,
  isSearching,
  onSearchingChange,
  query,
  onQueryChange,
}: InboxToolbarProps) {
  const close = () => {
    onQueryChange('');
    onSearchingChange(false);
    Keyboard.dismiss();
  };

  return (
    <View
      testID="chat-inbox-toolbar"
      className="flex-row items-center justify-between px-4 pb-4 pt-3"
    >
      <TouchableOpacity
        testID="chat-inbox-search-open"
        accessibilityLabel="بحث"
        onPress={() => onSearchingChange(true)}
        className="h-10 w-10 items-center justify-center rounded-[14px]"
      >
        <Image
          source={require('@/assets/icons/chat/inbox/search.svg')}
          style={{ width: 26, height: 26, position: 'relative', top: -3 }}
        />
      </TouchableOpacity>

      {isSearching ? (
        <View className="mx-2 h-11 flex-1 flex-row items-center rounded-full border-[0.5px] border-[#C5A36D] bg-[#F9FAFE] px-4">
          <TextInput
            testID="chat-inbox-search"
            autoFocus
            className="h-11 flex-1 py-0 text-right font-cairo text-[13px] text-[#111111]"
            placeholder="ابحث باسم المستخدم..."
            placeholderTextColor="#989898"
            value={query}
            onChangeText={onQueryChange}
            textAlign="right"
          />
        </View>
      ) : (
        <InboxTabs active={activeTab} onChange={onTabChange} />
      )}

      <TouchableOpacity
        testID={isSearching ? 'chat-inbox-search-clear' : 'chat-inbox-plus'}
        accessibilityLabel={isSearching ? 'إلغاء البحث' : 'بحث'}
        onPress={isSearching ? close : () => onSearchingChange(true)}
        className="h-10 w-10 items-center justify-center rounded-[14px]"
      >
        <Image
          source={
            isSearching
              ? require('@/assets/icons/chat/inbox/close.svg')
              : require('@/assets/icons/chat/inbox/plus.svg')
          }
          style={{ width: 24, height: 24 }}
        />
      </TouchableOpacity>
    </View>
  );
}
