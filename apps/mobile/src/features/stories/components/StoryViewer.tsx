import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStoryActions } from '../hooks/useStoryActions';
import { useStoryPlayback } from '../hooks/useStoryPlayback';
import {
  type StoryViewerSourceKind,
  useStoryViewerSource,
} from '../hooks/useStoryViewerSource';
import StoryFooter from './StoryFooter';
import StoryHeader from './StoryHeader';
import StoryMedia from './StoryMedia';
import StoryProgressBars from './StoryProgressBars';
import StoryTapZones from './StoryTapZones';
import StoryViewerSheets from './StoryViewerSheets';

export {
  STORY_IMAGE_MS,
  STORY_LINK_MARGIN_MS,
  STORY_VIDEO_FALLBACK_MS,
  STORY_VIEW_AFTER_MS,
} from '../storyViewerConstants';

interface StoryViewerProps {
  authorId: string;
  // From the tray (swipe on to the next authors), one author's profile, or
  // the author's own stories
  source: StoryViewerSourceKind;
}

/**
 * The full-screen stories viewer. Story media is cached in memory only
 * (never on disk) so it doesn't outlive the story on the phone. Data comes
 * from useStoryViewerSource, what's on screen and its clock from
 * useStoryPlayback, and reply / report / delete from useStoryActions.
 */
export default function StoryViewer({ authorId, source }: StoryViewerProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // The author looking at its own stories: views and delete, no reply,
  // report or view recording
  const isMine = source === 'mine';

  const reportSheet = useRef<BottomSheetModal>(null);
  const viewersSheet = useRef<BottomSheetModal>(null);
  const deleteSheet = useRef<BottomSheetModal>(null);
  const [holding, setHolding] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewersFor, setViewersFor] = useState<string | null>(null);

  const close = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [router]);

  // A reply on its way (opening the chat) pauses the story
  const [replying, setReplying] = useState(false);

  const data = useStoryViewerSource(authorId, source);
  const playback = useStoryPlayback({
    authorId,
    authors: data.authors,
    counts: data.counts,
    loading: data.loading,
    fetched: data.fetched,
    refetch: data.refetch,
    isMine,
    paused: holding || sheetOpen || replying,
    close,
  });
  const { position, current, author, progress } = playback;
  const actions = useStoryActions({
    author,
    current,
    afterDelete: data.refetchMine,
    setReplying,
  });

  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(20)
    .onEnd((e) => playback.onSwipe(e.translationX, e.translationY));

  if (!current || !author || !position) {
    return (
      <View className="flex-1 items-center justify-center bg-black" testID="story-loading">
        <StatusBar style="light" />
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black" testID="story-viewer">
      <StatusBar style="light" />
      <GestureDetector gesture={pan}>
        <View className="flex-1">
          <StoryMedia
            story={current}
            playing={playback.running}
            restartKey={playback.restart}
            loaded={playback.loaded}
            failed={playback.failed}
            onReady={playback.onMediaReady}
            onWaiting={playback.onMediaWaiting}
            onError={playback.onMediaError}
          />
          <StoryTapZones onTap={playback.onTap} onHold={setHolding} />

          <LinearGradient
            colors={['rgba(0,0,0,0.55)', 'transparent']}
            pointerEvents="box-none"
            style={{ paddingTop: insets.top + 8, paddingHorizontal: 12, paddingBottom: 24 }}
          >
            <View className="gap-3" pointerEvents="box-none">
              <StoryProgressBars
                count={author.stories.length}
                current={position.storyIndex}
                progress={progress}
              />
              <StoryHeader
                author={author.author}
                publishedAt={current.publishedAt}
                onClose={close}
                onOptions={() => {
                  setSheetOpen(true);
                  (isMine ? deleteSheet : reportSheet).current?.present();
                }}
              />
            </View>
          </LinearGradient>

          <View className="flex-1" pointerEvents="none" />

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            pointerEvents="box-none"
            style={{ paddingBottom: insets.bottom + 12, paddingHorizontal: 16, paddingTop: 24 }}
          >
            <StoryFooter
              story={current}
              replying={replying}
              onReply={() => void actions.reply()}
              onOpenProperty={(id) => router.push(`/property/${id}` as never)}
              own={
                isMine
                  ? {
                      viewCount: data.viewCountOf(current.id),
                      onViewers: () => {
                        setSheetOpen(true);
                        setViewersFor(current.id);
                        viewersSheet.current?.present();
                      },
                    }
                  : undefined
              }
            />
          </LinearGradient>
        </View>
      </GestureDetector>

      <StoryViewerSheets
        isMine={isMine}
        viewersSheet={viewersSheet}
        deleteSheet={deleteSheet}
        reportSheet={reportSheet}
        viewersFor={viewersFor}
        onViewersClosed={() => {
          setViewersFor(null);
          setSheetOpen(false);
        }}
        onDelete={() => void actions.remove().finally(() => setSheetOpen(false))}
        onReport={(reason, description) => void actions.report(reason, description)}
        onDismiss={() => setSheetOpen(false)}
      />
    </View>
  );
}
