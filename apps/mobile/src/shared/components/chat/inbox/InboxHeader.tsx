import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

/** «محادثاتي», with back on the right when it's a pushed screen. */
export default function InboxHeader({ onBack }: { onBack?: () => void }) {
  return (
    <View className="h-[52px] flex-row items-center justify-between px-4 py-[6px]">
      {onBack ? (
        <TouchableOpacity
          testID="chat-inbox-back"
          accessibilityLabel="رجوع"
          onPress={onBack}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          {/* Figma flips the asset: it points right, back under RTL */}
          <Image
            source={require('@/assets/icons/chat/inbox/back.svg')}
            style={{ width: 20, height: 20, transform: [{ scaleX: -1 }] }}
          />
        </TouchableOpacity>
      ) : (
        <View className="h-8 w-8" />
      )}
      <Text className="flex-1 text-center font-cairo-semibold text-[18px] leading-[24px] text-[#111111]">
        محادثاتي
      </Text>
      {/* Balances the back button so the title stays centred */}
      <View className="h-8 w-8" />
    </View>
  );
}
