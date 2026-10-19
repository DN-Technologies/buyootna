import { useLocalSearchParams } from 'expo-router';

import StoryViewer from '@/features/stories/components/StoryViewer';

/** Full-screen stories viewer: /stories/<authorId>?source=feed|author|mine */
export default function StoryViewerRoute() {
  const { authorId, source } = useLocalSearchParams<{
    authorId?: string;
    source?: string;
  }>();
  return (
    <StoryViewer
      authorId={authorId ?? ''}
      source={source === 'author' || source === 'mine' ? source : 'feed'}
    />
  );
}
