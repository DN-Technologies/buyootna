import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

interface ChatHeaderProps {
  userName: string;
  isOnline?: boolean;
  avatarUrl: string;
  isLoading?: boolean;
  onReportUser: () => void;
  showMoreMenu: boolean;
  setShowMoreMenu: (show: boolean) => void;
  // Opens the in-chat search bar
  onPressSearch?: () => void;
}

export default function ChatHeader({
  userName,
  avatarUrl,
  isLoading = false,
  onReportUser,
  showMoreMenu,
  setShowMoreMenu,
  onPressSearch,
}: ChatHeaderProps) {
  const router = useRouter();

  return (
    <View className="relative z-50 flex-row items-center justify-between border-b border-[#ECECEC] bg-white px-5 py-3">
      {/* Right Avatar & Back */}
      <View className="flex-row items-center gap-2">
        <TouchableOpacity testID="chat-back-button" onPress={() => router.back()}>
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        {isLoading ? (
          <View className="h-[44px] w-[44px] rounded-full bg-slate-200" />
        ) : (
          <Image
            source={{ uri: avatarUrl }}
            className="h-[44px] w-[44px] rounded-full bg-gray-100"
          />
        )}
      </View>

      {/* Center User Info */}
      <View className="flex-1 items-start pl-3">
        {isLoading ? (
          <View className="h-4 w-24 rounded bg-slate-200" />
        ) : (
          <Text
            testID="chat-header-name"
            className="font-cairo-medium text-[14px] text-[#0F1828]"
            // A long name wraps; its lines start at the avatar side (RTL)
            style={{ writingDirection: 'rtl', textAlign: 'auto' }}
            numberOfLines={2}
          >
            {userName}
          </Text>
        )}
      </View>

      {/* Left Actions */}
      <View className="flex-row items-center gap-4">
        <TouchableOpacity
          testID="chat-search-button"
          accessibilityLabel="بحث في المحادثة"
          onPress={onPressSearch}
        >
          <Feather name="search" size={20} color="#64748B" />
        </TouchableOpacity>

        <View className="relative">
          <TouchableOpacity onPress={() => setShowMoreMenu(!showMoreMenu)}>
            <Feather name="more-vertical" size={20} color="#64748B" />
          </TouchableOpacity>

          {showMoreMenu && (
            <View className="absolute right-[-8px] top-8 mt-4 w-48 rounded-xl bg-white shadow-md shadow-gray-200">
              <TouchableOpacity
                className="px-4 py-3"
                onPress={() => {
                  onReportUser();
                  setShowMoreMenu(false);
                }}
              >
                <Text
                  className="font-cairo text-sm leading-[22px] text-[#9C1E28]"
                  style={{ writingDirection: 'rtl' }}
                >
                  الإبلاغ عن المستخدم
                </Text>
              </TouchableOpacity>

              {/* Pointer / Triangle */}
              <View className="absolute -top-1.5 right-3 -z-10 h-4 w-4 rotate-45 rounded-sm bg-white shadow-md shadow-gray-200" />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
