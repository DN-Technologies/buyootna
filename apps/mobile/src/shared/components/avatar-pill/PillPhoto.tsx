import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { TouchableOpacity, View } from 'react-native';

interface PillPhotoProps {
  // Signed out, or no photo: the person placeholder
  avatarUrl: string | null | undefined;
  open: boolean;
  onPress: () => void;
}

/** The profile photo: one tap opens / closes the pill, two switch profile. */
export default function PillPhoto({ avatarUrl, open, onPress }: PillPhotoProps) {
  return (
    <TouchableOpacity
      testID="avatar-pill-photo"
      accessibilityRole="button"
      accessibilityLabel={open ? 'إغلاق' : 'الإشعارات والمحادثات'}
      accessibilityHint="انقر مرتين لتبديل الحساب"
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View className="size-[42px] items-center justify-center overflow-hidden rounded-full bg-[#F1F5F9]">
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <Feather name="user" size={22} color="#94A3B8" />
        )}
      </View>
    </TouchableOpacity>
  );
}
