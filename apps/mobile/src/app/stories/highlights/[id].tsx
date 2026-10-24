import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import {
  useHighlightMutations,
  useMyHighlights,
} from '@/features/stories/hooks/useStoryHighlights';
import HighlightForm from '@/features/stories/studio/HighlightForm';
import { showAlert } from '@/shared/utils/alert';

/** Editing one of the profile's highlights: name, stories, cover; or deleting it. */
export default function EditHighlightRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useMyHighlights();
  const { update, remove } = useHighlightMutations();
  const highlight = data?.highlights.find((h) => h.id === id);

  if (isLoading || !highlight) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#15304D" />
      </View>
    );
  }

  return (
    <HighlightForm
      heading="تعديل المميزة"
      initial={highlight}
      saving={update.isPending || remove.isPending}
      onSave={async (value) => {
        try {
          await update.mutateAsync({ id: highlight.id, input: value });
          router.back();
        } catch {
          showAlert('تعذر الحفظ', 'حاول مرة أخرى');
        }
      }}
      onDelete={() =>
        showAlert('حذف المميزة؟', 'تبقى قصصها في الأرشيف ما دامت ضمن آخر 30 يوماً.', [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'حذف',
            style: 'destructive',
            onPress: () =>
              remove.mutate(highlight.id, { onSuccess: () => router.back() }),
          },
        ])
      }
    />
  );
}
