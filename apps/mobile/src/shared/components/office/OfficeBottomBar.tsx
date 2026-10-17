import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OfficeBottomBarProps {
  // The office's contact number; without one (not added, or hidden) only
  // the chat button shows (Figma note 8971:32397)
  phone?: string | null;
  onCall: () => void;
  onChat: () => void;
}

/** ابدأ المحادثة and اتصال under an office profile (Figma 1326:43048). */
export default function OfficeBottomBar({
  phone,
  onCall,
  onChat,
}: OfficeBottomBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingBottom: Math.max(insets.bottom, 12),
        gap: 10,
        shadowColor: '#9D9D9D',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 2.45,
        elevation: 4,
      }}
      className="absolute bottom-0 left-0 right-0 flex-row items-center bg-white px-3 pt-4"
    >
      <TouchableOpacity
        testID="office-start-chat"
        accessibilityRole="button"
        activeOpacity={0.8}
        onPress={onChat}
        className="h-12 flex-1 flex-row items-center justify-center rounded-full bg-[#15304D] px-2"
        style={{ gap: 8 }}
      >
        <Feather name="message-square" size={20} color="#FFFFFF" />
        <Text className="font-cairo-bold text-[14px] leading-[22px] text-white">
          ابدأ المحادثة
        </Text>
      </TouchableOpacity>

      {!!phone && (
        <TouchableOpacity
          testID="office-call"
          accessibilityRole="button"
          activeOpacity={0.8}
          onPress={onCall}
          className="h-12 flex-1 flex-row items-center justify-center rounded-full border border-[#15304D] bg-white px-2"
          style={{ gap: 8 }}
        >
          <Feather name="phone" size={20} color="#15304D" />
          <Text className="font-cairo-bold text-[14px] leading-[22px] text-[#15304D]">
            اتصال
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
