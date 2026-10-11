import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import { BackChevronIcon } from '@/assets/icons/activity';
import { ChatMoreIcon, ChatSearchIcon } from '@/assets/icons/chat';

interface ChatHeaderProps {
  userName: string;
  // Their app is open right now: "متصل" and the dot on the avatar
  isOnline?: boolean;
  // They are writing a message: "يكتب الان..." takes the status line
  isTyping?: boolean;
  avatarUrl: string;
  isLoading?: boolean;
  onReportUser: () => void;
  showMoreMenu: boolean;
  setShowMoreMenu: (show: boolean) => void;
  // Opens the in-chat search bar
  onPressSearch?: () => void;
}

/**
 * Chat header (Figma 4410:168514): back, avatar and name on the right with
 * the status under the name; search and ⋮ on the left.
 */
export default function ChatHeader({
  userName,
  isOnline = false,
  isTyping = false,
  avatarUrl,
  isLoading = false,
  onReportUser,
  showMoreMenu,
  setShowMoreMenu,
  onPressSearch,
}: ChatHeaderProps) {
  const router = useRouter();

  return (
    <View className="relative z-50 h-[60px] flex-row items-center border-b-[0.5px] border-[#ECECEC] bg-white px-4 py-[6px]">
      <View className="flex-1 flex-row items-center gap-[6px]">
        <TouchableOpacity
          testID="chat-back-button"
          accessibilityLabel="رجوع"
          onPress={() => router.back()}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          {/* The asset points left; the back arrow points right under RTL */}
          <View style={{ transform: [{ scaleX: -1 }] }}>
            <BackChevronIcon color="#111111" />
          </View>
        </TouchableOpacity>

        <View className="flex-1 flex-row items-center gap-2">
          <View>
            {isLoading ? (
              <View className="h-11 w-11 rounded-full bg-slate-200" />
            ) : (
              <Image
                source={{ uri: avatarUrl }}
                className="h-11 w-11 rounded-full bg-gray-100"
              />
            )}
            {isOnline && !isLoading && (
              <View
                testID="chat-header-online-dot"
                // Physical bottom-right of the avatar: left/right swap under RTL
                className="absolute bottom-0 left-0 h-2 w-2 rounded-full border border-white bg-[#15A72B]"
              />
            )}
          </View>

          <View className="flex-1 items-start justify-center gap-1">
            {isLoading ? (
              <View className="h-4 w-24 rounded bg-slate-200" />
            ) : (
              <>
                <Text
                  testID="chat-header-name"
                  className="font-cairo-medium text-[16px] leading-[21px] text-[#0F1828]"
                  // A long name wraps; its lines start at the avatar side (RTL)
                  style={{ writingDirection: 'rtl', textAlign: 'auto' }}
                  numberOfLines={1}
                >
                  {userName}
                </Text>
                {isTyping ? (
                  <Text
                    testID="chat-header-typing"
                    className="font-cairo-medium text-[12px] leading-[15px] text-[#15A72B]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    يكتب الان...
                  </Text>
                ) : isOnline ? (
                  <View
                    testID="chat-header-online"
                    className="flex-row items-center gap-1"
                  >
                    <View className="h-[6px] w-[6px] rounded-full bg-[#15A72B]" />
                    <Text className="font-cairo-medium text-[12px] leading-[15px] text-[#15A72B]">
                      متصل
                    </Text>
                  </View>
                ) : null}
              </>
            )}
          </View>
        </View>
      </View>

      {/* Left: search, then ⋮ at the edge */}
      <View className="flex-row items-center gap-[2px]">
        <TouchableOpacity
          testID="chat-search-button"
          accessibilityLabel="بحث في المحادثة"
          onPress={onPressSearch}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          <ChatSearchIcon />
        </TouchableOpacity>

        <View className="relative">
          <TouchableOpacity
            testID="chat-more-button"
            accessibilityLabel="خيارات"
            onPress={() => setShowMoreMenu(!showMoreMenu)}
          >
            <ChatMoreIcon />
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
