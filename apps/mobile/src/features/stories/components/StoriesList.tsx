import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { type RefObject,useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import GoldSegment, {
  type GoldSegmentOption,
} from '@/shared/components/ui/GoldSegment';
import { useTabBarHeight } from '@/shared/hooks/device/useTabBarHeight';
import { useAuthStore } from '@/shared/store/useAuthStore';

import { useStoriesFeed } from '../hooks/useStoriesQueries';
import type { StoryAuthorType } from '../types';
import StoryListRow from './StoryListRow';

type Segment = 'all' | StoryAuthorType;

// In reading order: «الكل» on the right
const SEGMENTS: GoldSegmentOption<Segment>[] = [
  { id: 'all', label: 'الكل' },
  { id: 'OFFICE', label: 'مكاتب عقارية' },
  { id: 'COMPANY', label: 'شركات' },
];

interface StoriesListProps {
  // Signed out: the sign-in sheet
  authSheetRef: RefObject<BottomSheetModal | null>;
}

/**
 * «القصص» on the individual home (Figma 9377:34843): companies and offices
 * with live stories, newest unseen first, filtered by «الكل / مكاتب عقارية /
 * شركات». A row opens its stories; swiping on stays in the segment.
 */
export default function StoriesList({ authSheetRef }: StoriesListProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { scrollContentBottomPadding } = useTabBarHeight();
  const [segment, setSegment] = useState<Segment>('all');
  const type = segment === 'all' ? undefined : segment;
  const feed = useStoriesFeed(type);
  const { refetch } = feed;
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const header = (
    <View className="flex-row pb-[16px]">
      <GoldSegment
        testID="stories-segment"
        options={SEGMENTS}
        value={segment}
        onChange={setSegment}
      />
    </View>
  );

  if (!token) {
    return (
      <View className="flex-1 px-[16px] pt-[12px]">
        {header}
        <View className="flex-1 items-center justify-center" style={{ gap: 12 }}>
          <Text className="font-cairo text-[14px] text-[#6B6A6A]">
            سجل الدخول لمشاهدة القصص
          </Text>
          <TouchableOpacity
            testID="stories-sign-in"
            activeOpacity={0.8}
            onPress={() => authSheetRef.current?.present()}
            className="h-[40px] items-center justify-center rounded-full bg-[#15304D] px-[24px]"
          >
            <Text className="font-cairo-semibold text-[14px] text-white">
              تسجيل الدخول
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const empty = feed.isLoading ? (
    <View testID="stories-loading" style={{ gap: 13 }}>
      {Array.from({ length: 6 }, (_, i) => (
        <View key={i} className="flex-row items-center" style={{ gap: 8 }}>
          <View className="size-[60px] rounded-full bg-[#F1F5F9]" />
          <View style={{ gap: 6 }}>
            <View className="h-[12px] w-[112px] rounded-[4px] bg-[#F1F5F9]" />
            <View className="h-[12px] w-[64px] rounded-[4px] bg-[#F1F5F9]" />
          </View>
        </View>
      ))}
    </View>
  ) : feed.isError ? (
    <View className="items-center pt-[64px]" style={{ gap: 12 }}>
      <Text className="font-cairo text-[14px] text-[#6B6A6A]">
        تعذر تحميل القصص
      </Text>
      <TouchableOpacity
        testID="stories-retry"
        activeOpacity={0.8}
        onPress={() => void refetch()}
        className="h-[40px] items-center justify-center rounded-full border border-[#15304D] px-[24px]"
      >
        <Text className="font-cairo-semibold text-[14px] text-[#15304D]">
          إعادة المحاولة
        </Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View className="items-center pt-[64px]">
      <Text className="font-cairo text-[14px] text-[#6B6A6A]">
        لا توجد قصص حالياً
      </Text>
    </View>
  );

  return (
    <FlatList
      testID="stories-list"
      data={feed.authors}
      keyExtractor={(a) => a.author.identityId}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: scrollContentBottomPadding,
      }}
      ItemSeparatorComponent={() => <View style={{ height: 13 }} />}
      showsVerticalScrollIndicator={false}
      onEndReached={() => void feed.loadMore()}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        feed.isFetchingNextPage ? (
          <View className="items-center py-[16px]">
            <ActivityIndicator size="small" color="#15304D" />
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#15304D']}
          tintColor="#15304D"
        />
      }
      renderItem={({ item }) => (
        <StoryListRow
          item={item}
          onPress={() =>
            router.push({
              pathname: '/stories/[authorId]',
              params: {
                authorId: item.author.identityId,
                source: 'feed',
                ...(type ? { type } : {}),
              },
            } as never)
          }
        />
      )}
    />
  );
}
