import { useLocalSearchParams } from 'expo-router';

import ReelsViewer from '@/features/reels/components/ReelsViewer';

/**
 * The reels viewer: /reels (the main feed), with ?authorId= for one company's
 * or office's reels, and ?startId= to open at a reel.
 */
export default function ReelsRoute() {
  const { authorId, startId } = useLocalSearchParams<{
    authorId?: string;
    startId?: string;
  }>();
  return <ReelsViewer authorId={authorId} startId={startId} />;
}
