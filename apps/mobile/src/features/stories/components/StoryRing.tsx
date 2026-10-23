import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TouchableOpacity, View } from 'react-native';

import type { StoryAuthor } from '../types';

interface StoryRingProps {
  author: StoryAuthor;
  hasUnseen: boolean;
  // Some stories watched, new ones left: a dashed gold ring («القصص» list)
  partial?: boolean;
  // «القصص» list (Figma 9377:35314): a solid gold, thin ring
  variant?: 'tray' | 'list';
  size?: number;
  onPress?: () => void;
  testID?: string;
}

const GOLD = '#C5A36D';
const GREY = '#D7D7D7';

/**
 * A provider's avatar inside its story ring: gold while unseen, grey after.
 * With `partial`, dashed gold while some are left to watch.
 */
export default function StoryRing({
  author,
  hasUnseen,
  partial = false,
  variant = 'tray',
  size = 64,
  onPress,
  testID,
}: StoryRingProps) {
  const isList = variant === 'list';
  // The list's ring is 1/34 of the avatar, with a hairline white gap
  const inner = isList ? size * 0.9412 : size - 6;
  const ringState = !hasUnseen ? 'seen' : partial ? 'partial' : 'unseen';
  const avatar = (
    <View
      className={`items-center justify-center overflow-hidden rounded-full border-white bg-[#DEE3E8] ${
        isList ? '' : 'border-2'
      }`}
      style={{
        width: inner,
        height: inner,
        ...(isList ? { borderWidth: size * 0.0147 } : {}),
      }}
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
      {ringState === 'partial' ? (
        <View
          testID={testID ? `${testID}-partial` : undefined}
          className="items-center justify-center rounded-full border-2 border-dashed"
          style={{ width: size, height: size, borderColor: GOLD }}
        >
          {avatar}
        </View>
      ) : isList ? (
        <View
          testID={testID ? `${testID}-${ringState}` : undefined}
          className="items-center justify-center rounded-full"
          style={{
            width: size,
            height: size,
            backgroundColor: ringState === 'unseen' ? GOLD : GREY,
          }}
        >
          {avatar}
        </View>
      ) : hasUnseen ? (
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
