import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import type { StoryMedia } from '../../publishStory';
import { STORY_CAPTION_MAX } from '../../storyPhoto';
import type { TrimRange } from '../../videoEditor';
import { playArrowXml } from './storyIconXml';
import VideoTrimBar from './VideoTrimBar';

// Figma's glassy controls over the photo
const GLASS = {
  borderWidth: 0.83,
  borderColor: '#FFFFFF',
  backgroundColor: 'rgba(255,255,255,0.1)',
} as const;

interface ComposerPreviewProps {
  media: StoryMedia;
  canTrim: boolean;
  trim: TrimRange;
  onTrim: (range: TrimRange) => void;
  muted: boolean;
  onToggleMuted: () => void;
  caption: string;
  onCaption: (text: string) => void;
  linkedLabel: string | null;
  onLink: () => void;
  onUnlink: () => void;
  preparing: boolean;
  progress: number | null;
  onPublish: () => void;
  // Back to choosing another photo or video
  onDiscard: () => void;
}

/** The chosen video, playing only its kept part, looped. */
function PreviewVideo({
  uri,
  trim,
  muted,
  seekTo,
}: {
  uri: string;
  trim: TrimRange;
  muted: boolean;
  seekTo: number | null;
}) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 0.1;
    p.play();
  });
  const [playing, setPlaying] = useState(true);
  const range = useRef(trim);
  range.current = trim;

  useEffect(() => {
    player.muted = muted;
  }, [player, muted]);

  // Loops inside the kept part
  useEffect(() => {
    const sub = player.addListener('timeUpdate', ({ currentTime }) => {
      const { startMs, endMs } = range.current;
      if (currentTime * 1000 >= endMs || currentTime * 1000 < startMs - 250) {
        player.currentTime = startMs / 1000;
      }
    });
    const ended = player.addListener('playToEnd', () => {
      player.currentTime = range.current.startMs / 1000;
      player.play();
    });
    return () => {
      sub.remove();
      ended.remove();
    };
  }, [player]);

  // A handle moved: pause on that frame
  useEffect(() => {
    if (seekTo === null) return;
    player.pause();
    setPlaying(false);
    player.currentTime = seekTo / 1000;
  }, [player, seekTo]);

  const toggle = () => {
    if (playing) {
      player.pause();
    } else {
      player.play();
    }
    setPlaying(!playing);
  };

  return (
    <Pressable
      testID="composer-preview"
      accessibilityLabel={playing ? 'إيقاف' : 'تشغيل'}
      onPress={toggle}
      style={StyleSheet.absoluteFill}
    >
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />
      {!playing && (
        // Figma 9519:31497
        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center"
        >
          <View
            testID="composer-play"
            className="size-[64px] items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(20,20,20,0.6)' }}
          >
            <SvgXml xml={playArrowXml} width={42.667} height={42.667} />
          </View>
        </View>
      )}
    </Pressable>
  );
}

/**
 * The chosen photo or video full screen (Figma 9519:29609 / 9519:31410):
 * the video's trim bar and sound on top; the caption, the listing (image+)
 * and send at the bottom.
 */
export default function ComposerPreview({
  media,
  canTrim,
  trim,
  onTrim,
  muted,
  onToggleMuted,
  caption,
  onCaption,
  linkedLabel,
  onLink,
  onUnlink,
  preparing,
  progress,
  onPublish,
  onDiscard,
}: ComposerPreviewProps) {
  const insets = useSafeAreaInsets();
  const [seekTo, setSeekTo] = useState<number | null>(null);
  const busy = preparing || progress !== null;
  const isVideo = media.kind === 'VIDEO';

  return (
    <View className="flex-1 bg-black">
      {isVideo ? (
        <PreviewVideo
          uri={media.uri}
          trim={trim}
          muted={muted}
          seekTo={seekTo}
        />
      ) : (
        <Image
          testID="composer-preview"
          source={{ uri: media.uri }}
          contentFit="cover"
          cachePolicy="memory"
          style={StyleSheet.absoluteFill}
        />
      )}

      <View
        className="px-[12px]"
        style={{ paddingTop: insets.top + 16, gap: 8 }}
        pointerEvents="box-none"
      >
        <View className="flex-row px-[6px]" pointerEvents="box-none">
          <TouchableOpacity
            testID="composer-change"
            onPress={onDiscard}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="إلغاء"
            className="size-[40px] items-center justify-center rounded-full"
            style={{ ...GLASS, backgroundColor: 'rgba(17,17,17,0.1)' }}
          >
            <Image
              source={require('@/assets/icons/stories/close.svg')}
              style={{ width: 20, height: 20 }}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>
        {isVideo && canTrim && media.durationMs ? (
          <VideoTrimBar
            uri={media.uri}
            durationMs={media.durationMs}
            value={trim}
            onChange={onTrim}
            onSeek={setSeekTo}
            muted={muted}
            onToggleMuted={onToggleMuted}
          />
        ) : null}
      </View>

      <View className="flex-1" pointerEvents="none" />

      <View
        className="px-[16px] pt-[16px]"
        style={{ paddingBottom: insets.bottom + 12, gap: 10 }}
      >
        {linkedLabel && (
          <View className="flex-row">
            <View
              testID="composer-linked"
              className="h-[32px] max-w-full flex-row items-center rounded-full bg-white px-[12px]"
              style={{ gap: 6 }}
            >
              <Feather name="home" size={14} color="#15304D" />
              <Text
                numberOfLines={1}
                className="shrink font-cairo-semibold text-[13px] text-[#15304D]"
              >
                {linkedLabel}
              </Text>
              <TouchableOpacity
                testID="composer-unlink"
                onPress={onUnlink}
                hitSlop={8}
                accessibilityLabel="إزالة الإعلان"
              >
                <Feather name="x" size={14} color="#15304D" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View className="flex-row items-end" style={{ gap: 8 }}>
          <TouchableOpacity
            testID="composer-listing"
            onPress={onLink}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="ربط بإعلان"
            className="size-[42px] items-center justify-center rounded-[24px]"
            style={GLASS}
          >
            <Image
              source={require('@/assets/icons/stories/image-plus.svg')}
              style={{ width: 20.5, height: 20.5 }}
              contentFit="contain"
            />
            {linkedLabel && (
              <View
                className="absolute size-[8px] rounded-full bg-[#C5A36D]"
                style={{ top: 4, right: 4 }}
              />
            )}
          </TouchableOpacity>

          <View
            className="min-h-[44px] flex-1 justify-center rounded-[24px] px-[16px]"
            style={{ borderWidth: 1, borderColor: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <TextInput
              testID="composer-caption"
              value={caption}
              onChangeText={onCaption}
              editable={!busy}
              placeholder="اضافة شرح توضيحي...."
              placeholderTextColor="#FFFFFF"
              maxLength={STORY_CAPTION_MAX}
              multiline
              className="max-h-[96px] py-[10px] font-cairo-semibold text-[14px] text-white"
              style={{ writingDirection: 'rtl', textAlign: 'right' }}
            />
          </View>

          <TouchableOpacity
            testID="composer-publish"
            onPress={onPublish}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="نشر القصة"
            className="size-[42px] items-center justify-center rounded-[24px] bg-[#15304D]"
          >
            {progress !== null ? (
              <Text
                testID="composer-progress"
                className="font-cairo-bold text-[11px] text-white"
              >
                {Math.round(progress * 100)}%
              </Text>
            ) : preparing ? (
              <ActivityIndicator testID="composer-preparing" color="#FFFFFF" size="small" />
            ) : (
              <Image
                source={require('@/assets/icons/stories/send.svg')}
                // Figma turns the arrow to point the way the text reads
                style={{ width: 24, height: 24, transform: [{ scaleX: -1 }] }}
                contentFit="contain"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
