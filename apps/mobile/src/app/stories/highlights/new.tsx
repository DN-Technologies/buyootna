import { useLocalSearchParams, useRouter } from 'expo-router';

import { useHighlightMutations } from '@/features/stories/hooks/useStoryHighlights';
import HighlightForm from '@/features/stories/studio/HighlightForm';
import { showAlert } from '@/shared/utils/alert';

/** A new highlight; /stories/highlights/new?storyIds=a,b starts with those. */
export default function NewHighlightRoute() {
  const router = useRouter();
  const { storyIds } = useLocalSearchParams<{ storyIds?: string }>();
  const { create, update } = useHighlightMutations();

  return (
    <HighlightForm
      heading="مميزة جديدة"
      preselected={storyIds ? storyIds.split(',').filter(Boolean) : []}
      saving={create.isPending || update.isPending}
      onSave={async ({ title, storyIds: ids, coverStoryId }) => {
        try {
          const created = await create.mutateAsync({ title, storyIds: ids });
          // The first story is the cover unless another was chosen
          if (coverStoryId && coverStoryId !== ids[0]) {
            await update.mutateAsync({ id: created.id, input: { coverStoryId } });
          }
          router.back();
        } catch {
          showAlert('تعذر الحفظ', 'تحقق من الاسم والقصص وحاول مرة أخرى');
        }
      }}
    />
  );
}
