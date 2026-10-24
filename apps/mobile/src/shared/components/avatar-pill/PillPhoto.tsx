import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { TouchableOpacity, View } from 'react-native';

interface PillPhotoProps {
  // Signed out, or no photo: the person placeholder
  avatarUrl: string | null | undefined;
  open: boolean;
  onPress: () => void;
  // Companies and offices: the + on the photo adds a story
  onAddStory?: () => void;
}

/** The profile photo: one tap opens / closes the pill, two switch profile. */
export default function PillPhoto({
  avatarUrl,
  open,
  onPress,
  onAddStory,
}: PillPhotoProps) {
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
      {onAddStory && (
        <TouchableOpacity
          testID="avatar-pill-add-story"
          accessibilityRole="button"
          accessibilityLabel="إضافة قصة"
          hitSlop={8}
          onPress={onAddStory}
          className="absolute bottom-[-2px] size-[18px] items-center justify-center rounded-full bg-[#15304D]"
          // The app's RTL swaps left and right: this is the photo's
          // bottom-left, as on the story rings
          style={{ right: -2, borderWidth: 1.5, borderColor: '#FFFFFF' }}
        >
          <Feather name="plus" size={11} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
