import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TouchableOpacity, View } from 'react-native';

import type { StoryAuthor } from '../types';

interface StoryRingProps {
  author: StoryAuthor;
  hasUnseen: boolean;
  size?: number;
  onPress?: () => void;
  testID?: string;
}

/** A provider's avatar inside its story ring: gold while unseen, grey after. */
export default function StoryRing({
  author,
  hasUnseen,
  size = 64,
  onPress,
  testID,
}: StoryRingProps) {
  const inner = size - 6;
  const avatar = (
    <View
      className="items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#DEE3E8]"
      style={{ width: inner, height: inner }}
    >
      {author.logoUrl ? (
        <Image
          source={{ uri: author.logoUrl }}
          contentFit="cover"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <Text className="font-cairo-bold text-[18px] text-[#15304D]">
          {author.name.trim().charAt(0)}
        </Text>
      )}
    </View>
  );

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`قصص ${author.name}`}
      accessibilityState={{ selected: hasUnseen }}
    >
      {hasUnseen ? (
        <LinearGradient
          testID={testID ? `${testID}-unseen` : undefined}
          colors={['#FFD084', '#B28648']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {avatar}
        </LinearGradient>
      ) : (
        <View
          testID={testID ? `${testID}-seen` : undefined}
          className="items-center justify-center rounded-full border-2 border-[#D7D7D7]"
          style={{ width: size, height: size }}
        >
          {avatar}
        </View>
      )}
    </TouchableOpacity>
  );
}
