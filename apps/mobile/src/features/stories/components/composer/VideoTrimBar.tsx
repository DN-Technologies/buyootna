import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useEffect, useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { STORY_VIDEO_MAX_MS } from '../../storyPhoto';
import {
  formatClock,
  STORY_TRIM_MIN_MS,
  type TrimRange,
} from '../../videoEditor';
import { STORY_GLASS } from './storyGlass';

const FRAMES = 8;
const HANDLE = 12;
const HIT = 36;

interface VideoTrimBarProps {
  uri: string;
  durationMs: number;
  value: TrimRange;
  onChange: (range: TrimRange) => void;
  // A handle moved to this time (the preview shows that frame)
  onSeek: (ms: number) => void;
  muted: boolean;
  onToggleMuted: () => void;
}

/** Keeps a range within the video, 1–30 seconds long. */
export function clampTrim(
  range: TrimRange,
  durationMs: number,
  moved: 'start' | 'end',
): TrimRange {
  const max = Math.min(STORY_VIDEO_MAX_MS, durationMs);
  let { startMs, endMs } = range;
  if (moved === 'start') {
    startMs = Math.max(0, Math.max(endMs - max, Math.min(startMs, endMs - STORY_TRIM_MIN_MS)));
  } else {
    endMs = Math.min(durationMs, Math.min(startMs + max, Math.max(endMs, startMs + STORY_TRIM_MIN_MS)));
  }
  return { startMs, endMs };
}

/**
 * The video's frames with the kept part between two handles (Figma
 * 9519:31507), its «0:00 - 0:20» and the sound. Time runs left to right,
 * as in any video editor, whatever the app's direction.
 */
export default function VideoTrimBar({
  uri,
  durationMs,
  value,
  onChange,
  onSeek,
  muted,
  onToggleMuted,
}: VideoTrimBarProps) {
  const [width, setWidth] = useState(0);
  const [frames, setFrames] = useState<string[]>([]);
  const latest = useRef({ value, width, durationMs, onChange, onSeek });
  latest.current = { value, width, durationMs, onChange, onSeek };

  useEffect(() => {
    let live = true;
    void Promise.all(
      Array.from({ length: FRAMES }, (_, i) =>
        VideoThumbnails.getThumbnailAsync(uri, {
          time: Math.round(((i + 0.5) / FRAMES) * durationMs),
          quality: 0.3,
        })
          .then((t) => t.uri)
          .catch(() => ''),
      ),
    ).then((uris) => live && setFrames(uris));
    return () => {
      live = false;
    };
  }, [uri, durationMs]);

  // One responder per handle; it reads the latest props through the ref
  const responder = (which: 'start' | 'end') => {
    let from = 0;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        const { value: v } = latest.current;
        from = which === 'start' ? v.startMs : v.endMs;
      },
      onPanResponderMove: (_, g) => {
        const l = latest.current;
        if (!l.width) return;
        const ms = from + (g.dx / l.width) * l.durationMs;
        const next = clampTrim(
          which === 'start'
            ? { ...l.value, startMs: ms }
            : { ...l.value, endMs: ms },
          l.durationMs,
          which,
        );
        l.onChange(next);
        l.onSeek(which === 'start' ? next.startMs : next.endMs);
      },
      onPanResponderTerminationRequest: () => false,
    });
  };
  const startPan = useRef(responder('start')).current;
  const endPan = useRef(responder('end')).current;

  const x = (ms: number) => (width * ms) / durationMs;
  const left = x(value.startMs);
  const right = x(value.endMs);

  return (
    <View testID="composer-trim" className="w-full" style={{ gap: 6 }}>
      <View
        className="h-[44px] px-[6px]"
        style={{ direction: 'ltr' }}
        onLayout={(e: LayoutChangeEvent) =>
          setWidth(e.nativeEvent.layout.width - 12)
        }
      >
        <View
          className="h-[44px] flex-row overflow-hidden rounded-[6px]"
          style={{ ...STORY_GLASS, borderWidth: 1 }}
        >
          {frames.map((f, i) =>
            f ? (
              <Image
                key={i}
                source={{ uri: f }}
                style={{ flex: 1, height: '100%' }}
                contentFit="cover"
                cachePolicy="memory"
              />
            ) : (
              <View key={i} style={{ flex: 1 }} />
            ),
          )}
          {/* Outside the kept part: dimmed */}
          <View
            pointerEvents="none"
            className="absolute bottom-0 top-0 bg-black/60"
            style={{ left: 0, width: left }}
          />
          <View
            pointerEvents="none"
            className="absolute bottom-0 top-0 bg-black/60"
            style={{ left: right, right: 0 }}
          />
        </View>
        {/* The handles: Figma's white dots on the strip's edges */}
        {(['start', 'end'] as const).map((which) => (
          <View
            key={which}
            testID={`composer-trim-${which}`}
            {...(which === 'start' ? startPan : endPan).panHandlers}
            className="absolute items-center justify-center"
            style={{
              top: 22 - HIT / 2,
              left: 6 + (which === 'start' ? left : right) - HIT / 2,
              width: HIT,
              height: HIT,
            }}
          >
            <View
              className="rounded-full bg-white"
              style={{ width: HANDLE, height: HANDLE }}
            />
          </View>
        ))}
      </View>

      <View className="flex-row px-[6px]" style={{ gap: 8 }}>
        <TouchableOpacity
          testID="composer-sound"
          accessibilityRole="switch"
          accessibilityLabel="الصوت"
          accessibilityState={{ checked: !muted }}
          onPress={onToggleMuted}
          className="h-[24px] w-[32px] items-center justify-center rounded-full"
          style={STORY_GLASS}
        >
          {muted ? (
            // Figma has only the sound-on icon; off is the same family's
            <Feather name="volume-x" size={14} color="#FFFFFF" />
          ) : (
            <Image
              source={require('@/assets/icons/stories/sound-on.svg')}
              style={{ width: 14, height: 14 }}
              contentFit="contain"
            />
          )}
        </TouchableOpacity>
        <View
          className="h-[24px] items-center justify-center rounded-full px-[12px]"
          style={STORY_GLASS}
        >
          <Text
            testID="composer-trim-range"
            className="font-cairo-medium text-[12px] text-white"
          >
            {formatClock(value.startMs)} - {formatClock(value.endMs)}
          </Text>
        </View>
      </View>
    </View>
  );
}
