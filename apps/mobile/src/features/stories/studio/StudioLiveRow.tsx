import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import type { AuthorStory } from '../types';
import { hoursLeft, NAVY, stillOf } from './studioMedia';

interface StudioLiveRowProps {
  stories: AuthorStory[];
  // The profile's own id: its stories open in the viewer
  identityId: string;
}

/** «الآن»: «قصة جديدة», then the live stories with their views and time left. */
export default function StudioLiveRow({ stories, identityId }: StudioLiveRowProps) {
  const router = useRouter();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
    >
      <TouchableOpacity
        testID="studio-new-story"
        accessibilityRole="button"
        accessibilityLabel="قصة جديدة"
        activeOpacity={0.8}
        onPress={() => router.push('/stories/new' as never)}
        className="h-[160px] w-[100px] items-center justify-center rounded-[18px]"
        style={{ backgroundColor: NAVY, gap: 8 }}
      >
        <View className="size-[40px] items-center justify-center rounded-full bg-white/15">
          <Feather name="plus" size={22} color="#FFFFFF" />
        </View>
        <Text className="font-cairo-semibold text-[13px] leading-[20px] text-white">
          قصة جديدة
        </Text>
      </TouchableOpacity>

      {stories.map((story) => {
        const still = stillOf(story);
        const hours = hoursLeft(story);
        return (
          <TouchableOpacity
            key={story.id}
            testID={`studio-live-${story.id}`}
            accessibilityRole="button"
            accessibilityLabel={`قصة، ${story.viewCount} مشاهدة`}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: '/stories/[authorId]',
                params: { authorId: identityId, source: 'mine' },
              } as never)
            }
            className="h-[160px] w-[100px] overflow-hidden rounded-[18px] bg-[#F1F5F9]"
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
                <Feather name="video" size={22} color="#94A3B8" />
              </View>
            )}
            <View className="absolute start-[6px] top-[6px] rounded-full bg-black/45 px-[7px] py-[1px]">
              <Text className="font-cairo-semibold text-[10px] leading-[16px] text-white">
                {hours < 1 ? 'أقل من ساعة' : `${hours} س`}
              </Text>
            </View>
            <View
              className="absolute bottom-[6px] start-[6px] flex-row items-center rounded-full bg-black/45 px-[7px] py-[1px]"
              style={{ gap: 3 }}
            >
              <Feather name="eye" size={11} color="#FFFFFF" />
              <Text className="font-cairo-semibold text-[10px] leading-[16px] text-white">
                {story.viewCount}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
