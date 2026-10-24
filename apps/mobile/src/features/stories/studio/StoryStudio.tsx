import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '@/shared/store/useAuthStore';

import { useAddToHighlight } from '../hooks/useAddToHighlight';
import { useMyStories } from '../hooks/useStoriesQueries';
import { useMyHighlights, useStoryArchive } from '../hooks/useStoryHighlights';
import StudioArchiveGrid from './StudioArchiveGrid';
import StudioHighlightsRow from './StudioHighlightsRow';
import StudioLiveRow from './StudioLiveRow';
import { NAVY } from './studioMedia';
import StudioSection from './StudioSection';

/**
 * «الاستوديو» (companies and offices): where the profile makes and keeps its
 * stories. Live ones with their views, its highlights (المميزة) shown on
 * its profile, and the 30-day archive to fill them from.
 */
export default function StoryStudio() {
  const insets = useSafeAreaInsets();
  const identityId = useAuthStore((s) => s.activeIdentity?.id ?? '');
  const live = useMyStories();
  const highlights = useMyHighlights();
  const archive = useStoryArchive();
  const addToHighlight = useAddToHighlight();
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const refetchLive = live.refetch;
  const refetchHighlights = highlights.refetch;
  const refetchArchive = archive.refetch;
  const refresh = useCallback(() => {
    void refetchLive();
    void refetchHighlights();
    void refetchArchive();
  }, [refetchLive, refetchHighlights, refetchArchive]);
  // Fresh after posting a story or editing a highlight
  useFocusEffect(refresh);

  const stopSelecting = () => {
    setSelecting(false);
    setSelected([]);
  };
  const toggle = (id: string) =>
    setSelected((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );

  return (
    <View className="flex-1">
      <ScrollView
        testID="story-studio"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={live.isRefetching || highlights.isRefetching}
            onRefresh={refresh}
            tintColor={NAVY}
          />
        }
      >
        <StudioSection title="الآن" hint="قصصك المنشورة، تختفي بعد 24 ساعة">
          <StudioLiveRow stories={live.data?.stories ?? []} identityId={identityId} />
        </StudioSection>

        <StudioSection title="المميزة" hint="تبقى ظاهرة في ملفك لكل الزوار">
          <StudioHighlightsRow
            highlights={highlights.data?.highlights ?? []}
            identityId={identityId}
          />
        </StudioSection>

        <StudioSection
          title="الأرشيف"
          hint="آخر 30 يوماً، تراه أنت فقط"
          action={
            archive.stories.length
              ? {
                  label: selecting ? 'إلغاء' : 'تحديد',
                  onPress: selecting ? stopSelecting : () => setSelecting(true),
                  testID: 'studio-select',
                }
              : undefined
          }
        >
          <StudioArchiveGrid
            stories={archive.stories}
            identityId={identityId}
            selecting={selecting}
            selected={selected}
            onToggle={toggle}
          />
          {archive.hasNextPage && (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => void archive.fetchNextPage()}
              className="mt-3 items-center py-2"
            >
              {archive.isFetchingNextPage ? (
                <ActivityIndicator color={NAVY} />
              ) : (
                <Text className="font-cairo-semibold text-[14px] text-[#15304D]">
                  عرض المزيد
                </Text>
              )}
            </TouchableOpacity>
          )}
        </StudioSection>
      </ScrollView>

      {selecting && selected.length > 0 && (
        <View
          className="absolute inset-x-4"
          style={{ bottom: 110 + insets.bottom }}
        >
          <TouchableOpacity
            testID="studio-add-to-highlight"
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={() => addToHighlight(selected, stopSelecting)}
            className="h-[50px] items-center justify-center rounded-full"
            style={{ backgroundColor: NAVY }}
          >
            <Text className="font-cairo-bold text-[15px] leading-[24px] text-white">
              إضافة إلى المميزة ({selected.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
