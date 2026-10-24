import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

const GOLD = '#C5A36D';

interface HighlightCircleProps {
  title: string;
  coverUrl: string | null;
  onPress: () => void;
  onLongPress?: () => void;
  testID?: string;
}

/** One highlight (المميزة): its cover in a gold ring, its title under it. */
export default function HighlightCircle({
  title,
  coverUrl,
  onPress,
  onLongPress,
  testID,
}: HighlightCircleProps) {
  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={onLongPress ? 'اضغط مطولاً للتعديل' : undefined}
      activeOpacity={0.8}
      onPress={onPress}
      onLongPress={onLongPress}
      className="w-[72px] items-center"
      style={{ gap: 6 }}
    >
      <View
        className="size-[68px] items-center justify-center rounded-full"
        style={{ borderWidth: 2, borderColor: GOLD }}
      >
        <View className="size-[60px] items-center justify-center overflow-hidden rounded-full bg-[#F1F5F9]">
          {coverUrl ? (
            <Image
              source={{ uri: coverUrl }}
              cachePolicy="memory"
              contentFit="cover"
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <Feather name="star" size={20} color={GOLD} />
          )}
        </View>
      </View>
      <Text
        numberOfLines={1}
        className="w-full text-center font-cairo-medium text-[12px] leading-[18px] text-[#111111]"
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
