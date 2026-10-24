import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

import type { ViewerStory } from '../types';
import { GOLD, isLive, NAVY, postedDay, stillOf } from './studioMedia';

const COLUMNS = 3;
const GAP = 4;
const SIDE = 16;

interface StudioArchiveGridProps {
  stories: ViewerStory[];
  identityId: string;
  // «تحديد»: taps pick stories instead of playing them
  selecting: boolean;
  selected: string[];
  onToggle: (storyId: string) => void;
}

/** «الأرشيف»: the last 30 days, three to a row, newest first. */
export default function StudioArchiveGrid({
  stories,
  identityId,
  selecting,
  selected,
  onToggle,
}: StudioArchiveGridProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const tile = (width - SIDE * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  if (stories.length === 0) {
    return (
      <View className="mx-4 items-center rounded-[18px] bg-[#F8FAFC] px-6 py-8">
        <Feather name="archive" size={22} color="#94A3B8" />
        <Text className="mt-2 text-center font-cairo text-[13px] leading-[20px] text-[#6B6A6A]">
          تظهر هنا قصصك بعد انتهائها، لمدة 30 يوماً، لتضيفها إلى المميزة
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap" style={{ paddingHorizontal: SIDE, gap: GAP }}>
      {stories.map((story) => {
        const still = stillOf(story);
        const order = selected.indexOf(story.id);
        return (
          <TouchableOpacity
            key={story.id}
            testID={`studio-archive-${story.id}`}
            accessibilityRole={selecting ? 'checkbox' : 'button'}
            accessibilityState={selecting ? { checked: order > -1 } : undefined}
            accessibilityLabel={`قصة ${postedDay(story)}`}
            activeOpacity={0.85}
            onPress={() =>
              selecting
                ? onToggle(story.id)
                : router.push({
                    pathname: '/stories/[authorId]',
                    params: { authorId: identityId, source: 'archive', storyId: story.id },
                  } as never)
            }
            className="overflow-hidden rounded-[10px] bg-[#F1F5F9]"
            style={{ width: tile, height: tile * 1.6 }}
          >
            {still ? (
              <Image
                source={{ uri: still }}
                cachePolicy="memory"
                contentFit="cover"
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Feather name="video" size={20} color="#94A3B8" />
              </View>
            )}
            <View className="absolute bottom-[5px] start-[5px] rounded-full bg-black/45 px-[6px]">
              <Text className="font-cairo-semibold text-[10px] leading-[16px] text-white">
                {isLive(story) ? 'الآن' : postedDay(story)}
              </Text>
            </View>
            {selecting && (
              <View
                className="absolute end-[6px] top-[6px] size-[22px] items-center justify-center rounded-full"
                style={{
                  backgroundColor: order > -1 ? NAVY : 'rgba(0,0,0,0.25)',
                  borderWidth: 1.5,
                  borderColor: order > -1 ? GOLD : '#FFFFFF',
                }}
              >
                {order > -1 && (
                  <Text className="font-cairo-bold text-[11px] leading-[16px] text-white">
                    {order + 1}
                  </Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
