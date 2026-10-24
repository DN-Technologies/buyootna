import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { showAlert } from '@/shared/utils/alert';

import HighlightCircle from '../components/HighlightCircle';
import { useHighlightMutations } from '../hooks/useStoryHighlights';
import type { StoryHighlight } from '../types';
import { GOLD } from './studioMedia';

interface StudioHighlightsRowProps {
  highlights: StoryHighlight[];
  identityId: string;
  // «ترتيب»: arrows under each move it, nothing opens
  reordering?: boolean;
  onMove?: (id: string, by: -1 | 1) => void;
}

/**
 * «المميزة»: «جديدة», then each highlight. A tap plays it; a long press
 * edits or deletes it.
 */
export default function StudioHighlightsRow({
  highlights,
  identityId,
  reordering = false,
  onMove,
}: StudioHighlightsRowProps) {
  const router = useRouter();
  const { remove } = useHighlightMutations();

  const play = (highlight: StoryHighlight) =>
    router.push({
      pathname: '/stories/[authorId]',
      params: { authorId: identityId, source: 'highlight', highlightId: highlight.id },
    } as never);

  const manage = (highlight: StoryHighlight) =>
    showAlert(highlight.title, '', [
      {
        text: 'تعديل',
        onPress: () =>
          router.push({
            pathname: '/stories/highlights/[id]',
            params: { id: highlight.id },
          } as never),
      },
      {
        text: 'حذف المميزة',
        style: 'destructive',
        onPress: () =>
          showAlert(
            'حذف المميزة؟',
            'تبقى قصصها في الأرشيف ما دامت ضمن آخر 30 يوماً.',
            [
              { text: 'إلغاء', style: 'cancel' },
              {
                text: 'حذف',
                style: 'destructive',
                onPress: () => remove.mutate(highlight.id),
              },
            ],
          ),
      },
      { text: 'إلغاء', style: 'cancel' },
    ]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
    >
      {!reordering && (
        <TouchableOpacity
          testID="studio-new-highlight"
          accessibilityRole="button"
          accessibilityLabel="مميزة جديدة"
          activeOpacity={0.8}
          onPress={() => router.push('/stories/highlights/new' as never)}
          className="w-[72px] items-center"
          style={{ gap: 6 }}
        >
          <View
            className="size-[68px] items-center justify-center rounded-full"
            style={{ borderWidth: 1.5, borderColor: GOLD, borderStyle: 'dashed' }}
          >
            <Feather name="plus" size={24} color={GOLD} />
          </View>
          <Text className="font-cairo-medium text-[12px] leading-[18px] text-[#111111]">
            جديدة
          </Text>
        </TouchableOpacity>
      )}

      {highlights.map((highlight, i) => (
        <View key={highlight.id} className="items-center" style={{ gap: 6 }}>
          <HighlightCircle
            testID={`studio-highlight-${highlight.id}`}
            title={highlight.title}
            coverUrl={highlight.coverUrl}
            onPress={() =>
              reordering
                ? undefined
                : highlight.stories.length
                  ? play(highlight)
                  : manage(highlight)
            }
            onLongPress={reordering ? undefined : () => manage(highlight)}
          />
          {reordering && (
            // In reading order: › moves it earlier (to the right), ‹ later
            <View className="flex-row" style={{ gap: 6 }}>
              {(
                [
                  [-1, 'chevron-right', 'تقديم', i === 0],
                  [1, 'chevron-left', 'تأخير', i === highlights.length - 1],
                ] as const
              ).map(([by, icon, label, edge]) => (
                <TouchableOpacity
                  key={by}
                  testID={`studio-move-${highlight.id}-${by === -1 ? 'earlier' : 'later'}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${label} «${highlight.title}»`}
                  disabled={edge}
                  hitSlop={6}
                  onPress={() => onMove?.(highlight.id, by)}
                  className="size-[28px] items-center justify-center rounded-full bg-[#F6F7F9]"
                  style={{ opacity: edge ? 0.35 : 1 }}
                >
                  <Feather name={icon} size={16} color="#15304D" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
