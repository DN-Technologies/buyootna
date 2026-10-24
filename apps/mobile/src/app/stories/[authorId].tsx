import { useLocalSearchParams } from 'expo-router';

import StoryViewer from '@/features/stories/components/StoryViewer';

const SOURCES = ['feed', 'author', 'mine', 'archive', 'highlight'] as const;
type Source = (typeof SOURCES)[number];

/**
 * Full-screen stories viewer:
 * /stories/<authorId>?source=feed|author|mine|archive|highlight
 *   [&type=COMPANY|OFFICE] [&storyId=…] (archive) [&highlightId=…] (highlight)
 */
export default function StoryViewerRoute() {
  const { authorId, source, type, storyId, highlightId } = useLocalSearchParams<{
    authorId?: string;
    source?: string;
    type?: string;
    storyId?: string;
    highlightId?: string;
  }>();
  return (
    <StoryViewer
      authorId={authorId ?? ''}
      source={SOURCES.includes(source as Source) ? (source as Source) : 'feed'}
      feedType={type === 'COMPANY' || type === 'OFFICE' ? type : undefined}
      storyId={storyId}
      highlightId={highlightId}
    />
  );
}
