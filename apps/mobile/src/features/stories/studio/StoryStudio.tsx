import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
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

import { useMyStories } from '../hooks/useStoriesQueries';
import {
  useHighlightMutations,
  useMyHighlights,
  useStoryArchive,
} from '../hooks/useStoryHighlights';
import HighlightPickerSheet from './HighlightPickerSheet';
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
  const pickerSheet = useRef<BottomSheetModal>(null);
  const { reorder } = useHighlightMutations();
  // «ترتيب»: the highlights' ids in their new order, until «تم»
  const [order, setOrder] = useState<string[] | null>(null);
  const savedHighlights = highlights.data?.highlights ?? [];
  const shownHighlights = order
    ? (order
        .map((id) => savedHighlights.find((h) => h.id === id))
        .filter(Boolean) as typeof savedHighlights)
    : savedHighlights;
  const move = (id: string, by: -1 | 1) =>
    setOrder((ids) => {
      const next = [...(ids ?? [])];
      const from = next.indexOf(id);
      const to = from + by;
      if (from < 0 || to < 0 || to >= next.length) return ids;
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  const finishOrder = () => {
    const before = savedHighlights.map((h) => h.id);
    if (order && order.join() !== before.join()) reorder.mutate(order);
    setOrder(null);
  };
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

        <StudioSection
          title="المميزة"
          hint={order ? 'حرّكها بالأسهم ثم اضغط تم' : 'تبقى ظاهرة في ملفك لكل الزوار'}
          action={
            savedHighlights.length > 1
              ? {
                  label: order ? 'تم' : 'ترتيب',
                  onPress: order
                    ? finishOrder
                    : () => setOrder(savedHighlights.map((h) => h.id)),
                  testID: 'studio-reorder',
                }
              : undefined
          }
        >
          <StudioHighlightsRow
            highlights={shownHighlights}
            identityId={identityId}
            reordering={!!order}
            onMove={move}
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
            onPress={() => pickerSheet.current?.present()}
            className="h-[50px] items-center justify-center rounded-full"
            style={{ backgroundColor: NAVY }}
          >
            <Text className="font-cairo-bold text-[15px] leading-[24px] text-white">
              إضافة إلى المميزة ({selected.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <HighlightPickerSheet ref={pickerSheet} storyIds={selected} onDone={stopSelecting} />
    </View>
  );
}
