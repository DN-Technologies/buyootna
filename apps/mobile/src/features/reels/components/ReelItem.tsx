import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { type VideoPlayer,VideoView } from 'expo-video';
import { memo, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeOut,
  type SharedValue,
  useAnimatedStyle,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { VerifiedBadgeIcon } from '@/assets/icons/activity';
import { STORY_GLASS } from '@/features/stories/components/composer/storyGlass';
import {
  moreXml,
  shareXml,
} from '@/features/stories/components/composer/storyIconXml';
import { storyFit } from '@/features/stories/storyFrame';
import { getArabicCategoryLabel } from '@/shared/utils/helpers/property';
import { formatTimeAgo } from '@/shared/utils/helpers/time';

import type { ReelStatus } from '../hooks/useReelPlayers';
import { formatReelCount } from '../reelRules';
import type { ViewerReel } from '../types';

const GOLD = '#FFD084';
const NAVY = '#15304D';
const HEART_MS = 650;

interface ReelItemProps {
  reel: ViewerReel;
  height: number;
  // Only the reels around the one on screen have one
  player: VideoPlayer | null;
  active: boolean;
  status: ReelStatus | undefined;
  paused: boolean;
  progress: SharedValue<number>;
  onTogglePause: () => void;
  onRetry: () => void;
  onDoubleTap: () => void;
  onLike: () => void;
  canFollow: boolean;
  onFollow: () => void;
  onComments: () => void;
  onMessage: () => void;
  onShare: () => void;
  onOptions: () => void;
  onOpenProfile: () => void;
  onOpenListing: (propertyId: string) => void;
}

function RailButton({
  testID,
  label,
  count,
  onPress,
  children,
}: {
  testID: string;
  label: string;
  count?: string;
  onPress?: () => void;
  children: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
      accessibilityLabel={label}
      className="items-center"
      style={{ gap: 4 }}
    >
      <View
        className="size-[46px] items-center justify-center rounded-full"
        style={STORY_GLASS}
      >
        {children}
      </View>
      {count !== undefined && (
        <Text
          className="font-cairo-semibold text-[12px] leading-[16px] text-white"
          style={styles.shadow}
        >
          {count}
        </Text>
      )}
    </TouchableOpacity>
  );
}

/**
 * One reel, filling the screen: the video over its poster, the author, caption
 * and listing on the reading side, the actions down the other. A tap pauses, a
 * double tap likes. The app's navy and gold over the Stories viewer's glass
 * controls, so it reads as the same app.
 */
function ReelItem({
  reel,
  height,
  player,
  active,
  status,
  paused,
  progress,
  onTogglePause,
  onRetry,
  onDoubleTap,
  onLike,
  canFollow,
  onFollow,
  onComments,
  onMessage,
  onShare,
  onOptions,
  onOpenProfile,
  onOpenListing,
}: ReelItemProps) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const [heart, setHeart] = useState(0);
  const [firstFrame, setFirstFrame] = useState(false);
  const fit = storyFit(reel.width, reel.height);

  useEffect(() => {
    if (!heart) return;
    const timer = setTimeout(() => setHeart(0), HEART_MS);
    return () => clearTimeout(timer);
  }, [heart]);

  // Each time a player leaves or comes back, the poster covers it until the
  // video's own picture is there
  useEffect(() => {
    if (!player) setFirstFrame(false);
  }, [player]);

  const single = Gesture.Tap()
    .runOnJS(true)
    .numberOfTaps(1)
    .onEnd((_e, success) => {
      if (success) onTogglePause();
    });
  const double = Gesture.Tap()
    .runOnJS(true)
    .numberOfTaps(2)
    .maxDelay(250)
    .onEnd((_e, success) => {
      if (success) {
        setHeart((n) => n + 1);
        onDoubleTap();
      }
    });
  const taps = Gesture.Exclusive(double, single);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.min(1, progress.value) * 100}%`,
  }));

  const listing = reel.property;
  const listingLabel = listing
    ? [getArabicCategoryLabel(listing.category), listing.location]
        .filter(Boolean)
        .join(' · ')
    : null;

  return (
    <View testID={`reel-${reel.id}`} style={{ height }} className="bg-black">
      <GestureDetector gesture={taps}>
        <View style={StyleSheet.absoluteFill}>
          {player && (
            <VideoView
              testID="reel-video"
              player={player}
              style={StyleSheet.absoluteFill}
              contentFit={fit}
              nativeControls={false}
              allowsPictureInPicture={false}
              onFirstFrameRender={() => setFirstFrame(true)}
            />
          )}
          {!firstFrame && (
            <Image
              testID="reel-poster"
              source={{ uri: reel.posterUrl }}
              contentFit={fit}
              cachePolicy="disk"
              transition={0}
              style={StyleSheet.absoluteFill}
            />
          )}
        </View>
      </GestureDetector>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View className="flex-1 items-center justify-center">
          {active && status === 'loading' && firstFrame === false && (
            <ActivityIndicator testID="reel-loading" color="#FFFFFF" />
          )}
          {active && paused && status !== 'error' && (
            <View
              testID="reel-paused"
              className="size-[64px] items-center justify-center rounded-full"
              style={STORY_GLASS}
            >
              <Ionicons name="play" size={30} color="#FFFFFF" />
            </View>
          )}
          {heart > 0 && (
            <Animated.View
              key={heart}
              entering={ZoomIn.duration(180)}
              exiting={FadeOut.duration(200)}
              style={styles.heart}
            >
              <Ionicons name="heart" size={96} color="#EF4444" />
            </Animated.View>
          )}
        </View>
      </View>

      {active && status === 'error' && (
        <View
          style={StyleSheet.absoluteFill}
          pointerEvents="box-none"
          className="items-center justify-center"
        >
          <TouchableOpacity
            testID="reel-retry"
            onPress={onRetry}
            activeOpacity={0.8}
            className="h-[44px] flex-row items-center justify-center rounded-full px-[20px]"
            style={[STORY_GLASS, { gap: 8 }]}
          >
            <Feather name="refresh-cw" size={16} color="#FFFFFF" />
            <Text className="font-cairo-semibold text-[14px] text-white">
              إعادة المحاولة
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.72)']}
        pointerEvents="box-none"
        style={[styles.bottom, { paddingBottom: insets.bottom + 18 }]}
      >
        <View
          className="flex-row items-end"
          style={{ gap: 12 }}
          pointerEvents="box-none"
        >
          {/* The reading side: who, what, and the listing */}
          <View className="flex-1" style={{ gap: 10 }} pointerEvents="box-none">
            <TouchableOpacity
              testID="reel-author"
              onPress={onOpenProfile}
              activeOpacity={0.8}
              className="flex-row items-center self-start"
              style={{ gap: 8 }}
            >
              <View
                className="size-[42px] items-center justify-center overflow-hidden rounded-full bg-[#DEE3E8]"
                style={{ borderWidth: 1.5, borderColor: GOLD }}
              >
                {reel.author.logoUrl ? (
                  <Image
                    source={{ uri: reel.author.logoUrl }}
                    contentFit="cover"
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <Text className="font-cairo-bold text-[16px] text-[#15304D]">
                    {reel.author.name.trim().charAt(0)}
                  </Text>
                )}
              </View>
              <View className="shrink items-start">
                <View className="flex-row items-center" style={{ gap: 4 }}>
                  <Text
                    testID="reel-author-name"
                    numberOfLines={1}
                    className="shrink font-cairo-semibold text-[15px] leading-[22px] text-white"
                    style={styles.shadow}
                  >
                    {reel.author.name}
                  </Text>
                  {reel.author.isVerified && <VerifiedBadgeIcon size={14} />}
                </View>
                <Text
                  numberOfLines={1}
                  className="font-cairo text-[12px] leading-[18px] text-[#E3E3E3]"
                  style={styles.shadow}
                >
                  {formatTimeAgo(reel.publishedAt)} ·{' '}
                  {formatReelCount(reel.viewCount)} مشاهدة
                </Text>
              </View>
            </TouchableOpacity>
            {canFollow && (
              <TouchableOpacity
                testID="reel-follow"
                onPress={onFollow}
                activeOpacity={0.85}
                accessibilityLabel={reel.followed ? 'إلغاء المتابعة' : 'متابعة'}
                className="h-[28px] items-center justify-center self-start rounded-full px-[12px]"
                style={
                  reel.followed ? STORY_GLASS : { backgroundColor: GOLD }
                }
              >
                <Text
                  className={`font-cairo-semibold text-[12px] leading-[17px] ${
                    reel.followed ? 'text-white' : 'text-[#15304D]'
                  }`}
                >
                  {reel.followed ? 'تتابعه' : 'متابعة'}
                </Text>
              </TouchableOpacity>
            )}

            {!!reel.caption && (
              <Pressable onPress={() => setExpanded((e) => !e)}>
                <Text
                  testID="reel-caption"
                  numberOfLines={expanded ? undefined : 2}
                  className="font-cairo-medium text-[14px] leading-[22px] text-white"
                  style={[styles.shadow, { writingDirection: 'rtl' }]}
                >
                  {reel.caption}
                </Text>
              </Pressable>
            )}

            {listing ? (
              <TouchableOpacity
                testID="reel-open-listing"
                onPress={() => onOpenListing(listing.id)}
                activeOpacity={0.85}
                className="flex-row items-center rounded-[14px] p-[8px]"
                style={[STORY_GLASS, { gap: 10 }]}
              >
                <View className="size-[44px] items-center justify-center overflow-hidden rounded-[10px] bg-[#DEE3E8]">
                  {listing.coverUrl ? (
                    <Image
                      source={{ uri: listing.coverUrl }}
                      contentFit="cover"
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <Feather name="home" size={18} color={NAVY} />
                  )}
                </View>
                <Text
                  numberOfLines={2}
                  className="flex-1 font-cairo-medium text-[13px] leading-[18px] text-white"
                  style={{ writingDirection: 'rtl' }}
                >
                  {listingLabel}
                </Text>
                <View
                  className="h-[34px] items-center justify-center rounded-full px-[12px]"
                  style={{ backgroundColor: GOLD }}
                >
                  <Text className="font-cairo-semibold text-[13px] text-[#15304D]">
                    عرض الإعلان
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                testID="reel-open-profile"
                onPress={onOpenProfile}
                activeOpacity={0.85}
                className="h-[38px] items-center justify-center self-start rounded-full px-[16px]"
                style={{ backgroundColor: GOLD }}
              >
                <Text className="font-cairo-semibold text-[13px] text-[#15304D]">
                  عرض الملف
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* The other side: what you can do with it */}
          <View className="items-center" style={{ gap: 14 }}>
            <RailButton
              testID="reel-like"
              label={reel.liked ? 'إلغاء الإعجاب' : 'إعجاب'}
              count={formatReelCount(reel.likeCount)}
              onPress={onLike}
            >
              <Ionicons
                name={reel.liked ? 'heart' : 'heart-outline'}
                size={25}
                color={reel.liked ? '#EF4444' : '#FFFFFF'}
              />
            </RailButton>
            {reel.commentsEnabled && (
              <RailButton
                testID="reel-comments-open"
                label="التعليقات"
                count={formatReelCount(reel.commentCount)}
                onPress={onComments}
              >
                <Ionicons name="chatbubble-outline" size={22} color="#FFFFFF" />
              </RailButton>
            )}
            <RailButton
              testID="reel-message"
              label="إرسال رسالة"
              onPress={onMessage}
            >
              <Feather name="send" size={21} color="#FFFFFF" />
            </RailButton>
            <RailButton testID="reel-share" label="مشاركة" onPress={onShare}>
              <SvgXml xml={shareXml} width={24} height={24} />
            </RailButton>
            <RailButton
              testID="reel-options"
              label="خيارات"
              onPress={onOptions}
            >
              <SvgXml xml={moreXml} width={24} height={24} />
            </RailButton>
          </View>
        </View>
      </LinearGradient>

      {active && (
        <View
          testID="reel-progress"
          pointerEvents="none"
          style={[styles.track, { bottom: insets.bottom + 4 }]}
        >
          <Animated.View style={[styles.fill, progressStyle]} />
        </View>
      )}
    </View>
  );
}

export default memo(ReelItem);

const styles = StyleSheet.create({
  bottom: {
    position: 'absolute',
    start: 0,
    end: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingTop: 48,
  },
  shadow: {
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
  },
  heart: {
    position: 'absolute',
  },
  track: {
    position: 'absolute',
    start: 14,
    end: 14,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: GOLD,
  },
});
