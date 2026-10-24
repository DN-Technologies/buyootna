import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';

import { useAuthorHighlights } from '../hooks/useStoryHighlights';
import HighlightCircle from './HighlightCircle';

/**
 * A company's or office's highlights (المميزة) on its profile, each opening
 * in the stories viewer. Nothing when it has none.
 */
export default function ProfileHighlights({ authorId }: { authorId?: string }) {
  const router = useRouter();
  const { data } = useAuthorHighlights(authorId);
  const highlights = data?.highlights ?? [];
  if (!authorId || highlights.length === 0) return null;

  return (
    <ScrollView
      testID="profile-highlights"
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-4"
      contentContainerStyle={{ gap: 12 }}
    >
      {highlights.map((highlight) => (
        <HighlightCircle
          key={highlight.id}
          testID={`profile-highlight-${highlight.id}`}
          title={highlight.title}
          coverUrl={highlight.coverUrl}
          onPress={() =>
            router.push({
              pathname: '/stories/[authorId]',
              params: { authorId, source: 'highlight', highlightId: highlight.id },
            } as never)
          }
        />
      ))}
    </ScrollView>
  );
}
