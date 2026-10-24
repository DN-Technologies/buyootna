import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { showAlert } from '@/shared/utils/alert';

import { useHighlightMutations, useMyHighlights } from './useStoryHighlights';

// A highlight takes at most this many stories (the server's limit)
const ITEMS_MAX = 100;
// Highlights offered in the picker; the rest are reached from the studio
const OFFERED = 6;

/**
 * «إضافة إلى المميزة»: asks which highlight (or a new one) and adds the
 * stories at its end. A new one opens its form with them chosen.
 */
export function useAddToHighlight() {
  const router = useRouter();
  const { data } = useMyHighlights();
  const { update } = useHighlightMutations();

  return useCallback(
    (storyIds: string[], onDone?: () => void) => {
      const highlights = data?.highlights ?? [];
      const toNew = () => {
        onDone?.();
        router.push({
          pathname: '/stories/highlights/new',
          params: { storyIds: storyIds.join(',') },
        } as never);
      };
      showAlert('إضافة إلى المميزة', '', [
        ...highlights.slice(0, OFFERED).map((h) => ({
          text: h.title,
          onPress: () => {
            const current = h.stories.map((s) => s.id);
            const added = storyIds.filter((id) => !current.includes(id));
            const next = [...current, ...added].slice(0, ITEMS_MAX);
            update.mutate(
              { id: h.id, input: { storyIds: next } },
              {
                onSuccess: () => {
                  onDone?.();
                  showAlert('تمت الإضافة', `أضيفت إلى «${h.title}»`);
                },
                onError: () =>
                  showAlert('تعذرت الإضافة', 'حاول مرة أخرى'),
              },
            );
          },
        })),
        { text: 'مميزة جديدة', onPress: toNew },
        { text: 'إلغاء', style: 'cancel' as const },
      ]);
    },
    [data, update, router],
  );
}
