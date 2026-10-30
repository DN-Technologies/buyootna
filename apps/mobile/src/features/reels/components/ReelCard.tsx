import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { eyeXml } from '@/features/stories/components/composer/storyIconXml';

import { formatReelCount } from '../reelRules';
import type { AuthorReel } from '../types';

export const REEL_CARD_WIDTH = 112;
export const REEL_CARD_HEIGHT = 199;

/** A reel in a row: its poster, who posted it (unless obvious), its views. */
export default function ReelCard({
  reel,
  authorName,
  showLikes = false,
  onPress,
}: {
  reel: AuthorReel;
  // Left out where it's obvious: its own profile, the author's studio
  authorName?: string;
  showLikes?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      testID={`reel-card-${reel.id}`}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={authorName ? `فيديو من ${authorName}` : 'فيديو'}
      className="overflow-hidden rounded-[14px] bg-[#15304D]"
      style={{ width: REEL_CARD_WIDTH, height: REEL_CARD_HEIGHT }}
    >
      <Image
        source={{ uri: reel.posterUrl }}
        contentFit="cover"
        cachePolicy="disk"
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.scrim}
      />
      <View className="absolute end-[8px] top-[8px]">
        <Ionicons name="play" size={16} color="#FFFFFF" />
      </View>
      <View className="absolute bottom-[8px] start-[8px] end-[8px]" style={{ gap: 2 }}>
        {!!authorName && (
          <Text
            numberOfLines={1}
            className="font-cairo-semibold text-[12px] leading-[17px] text-white"
          >
            {authorName}
          </Text>
        )}
        <View className="flex-row items-center" style={{ gap: 3 }}>
          <SvgXml xml={eyeXml} width={14} height={14} />
          <Text className="font-cairo text-[11px] leading-[15px] text-white">
            {formatReelCount(reel.viewCount)}
          </Text>
          {showLikes && (
            <>
              <Ionicons
                name="heart"
                size={12}
                color="#FFFFFF"
                style={{ marginStart: 6 }}
              />
              <Text className="font-cairo text-[11px] leading-[15px] text-white">
                {formatReelCount(reel.likeCount)}
              </Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    start: 0,
    end: 0,
    bottom: 0,
    height: 90,
  },
});
