import { useLocalSearchParams } from 'expo-router';

import StoryViewer from '@/features/stories/components/StoryViewer';

/**
 * Full-screen stories viewer:
 * /stories/<authorId>?source=feed|author|mine[&type=COMPANY|OFFICE]
 */
export default function StoryViewerRoute() {
  const { authorId, source, type } = useLocalSearchParams<{
    authorId?: string;
    source?: string;
    type?: string;
  }>();
  return (
    <StoryViewer
      authorId={authorId ?? ''}
      source={source === 'author' || source === 'mine' ? source : 'feed'}
      feedType={type === 'COMPANY' || type === 'OFFICE' ? type : undefined}
    />
  );
}
