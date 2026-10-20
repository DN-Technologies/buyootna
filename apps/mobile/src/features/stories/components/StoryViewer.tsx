import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useIsFocused } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  I18nManager,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WarningTriangleIcon } from '@/assets/icons/activity';
import ConfirmActionSheet from '@/features/individual/components/activity/offers/ConfirmActionSheet';
import { chatService } from '@/shared/api/chat.service';
import { storiesService } from '@/shared/api/stories.service';
import ReportReasonSheet from '@/shared/components/report/ReportReasonSheet';
import { useIdentity } from '@/shared/hooks/auth/useIdentity';
import { showAlert } from '@/shared/utils/alert';

import {
  useActiveIdentityId,
  useAuthorStories,
  useMarkStoryViewed,
  useMyStories,
  useStoriesFeed,
} from '../hooks/useStoriesQueries';
import { useStoryTimer } from '../hooks/useStoryTimer';
import { useStoryViewQueue } from '../hooks/useStoryViewQueue';
import {
  nextAuthor,
  nextStory,
  previousAuthor,
  previousStory,
  type StoryPosition,
  type StoryStep,
  swipeAction,
  tapAction,
  type TapSide,
} from '../storyNavigation';
import type { StoryAuthorStories } from '../types';
import StoryFooter from './StoryFooter';
import StoryHeader from './StoryHeader';
import StoryProgressBars from './StoryProgressBars';
import StoryVideo from './StoryVideo';
import StoryViewersSheet from './StoryViewersSheet';

// How long a photo story shows
export const STORY_IMAGE_MS = 5000;
// A video whose length the server didn't record (it always should)
export const STORY_VIDEO_FALLBACK_MS = 15_000;
// A story counts as viewed after this long on screen
export const STORY_VIEW_AFTER_MS = 1000;

const firstUnseen = (a: StoryAuthorStories | undefined) => {
  const i = a ? a.stories.findIndex((s) => !s.viewed) : -1;
  return i === -1 ? 0 : i;
};

interface StoryViewerProps {
  authorId: string;
  // From the tray (swipe on to the next authors) or one author's profile
  source: 'feed' | 'author' | 'mine';
}

/**
 * The full-screen stories viewer. Story media is cached in memory only
 * (never on disk) so it doesn't outlive the story on the phone.
 */
export default function StoryViewer({ authorId, source }: StoryViewerProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const identityId = useActiveIdentityId();
  const openedAs = useRef(identityId);
  const queue = useStoryViewQueue();
  const markViewed = useMarkStoryViewed();
  const reportSheet = useRef<BottomSheetModal>(null);

  const viewersSheet = useRef<BottomSheetModal>(null);
  const deleteSheet = useRef<BottomSheetModal>(null);

  // The author looking at its own stories: views and delete, no reply,
  // report or view recording
  const isMine = source === 'mine';
  const me = useIdentity();
  const mine = useMyStories(isMine);
  const feed = useStoriesFeed();
  const inFeed =
    source === 'feed' &&
    feed.authors.some((a) => a.author.identityId === authorId);
  const single = useAuthorStories(authorId, !inFeed && !isMine);

  const authors = useMemo<StoryAuthorStories[]>(() => {
    if (isMine) {
      const stories = mine.data?.stories ?? [];
      const type = me.activeIdentity?.type;
      if (stories.length === 0 || (type !== 'COMPANY' && type !== 'OFFICE')) {
        return [];
      }
      return [
        {
          author: {
            identityId: me.activeIdentity?.id ?? authorId,
            type,
            name: me.displayName,
            logoUrl: me.avatarUrl ?? null,
            isVerified: !!me.isVerified,
          },
          followed: false,
          hasUnseen: false,
          firstUnseenIndex: 0,
          stories,
        },
      ];
    }
    if (inFeed) return feed.authors.filter((a) => a.stories.length > 0);
    return single.data && single.data.stories.length > 0 ? [single.data] : [];
  }, [isMine, mine.data, me.activeIdentity, me.displayName, me.avatarUrl, me.isVerified, authorId, inFeed, feed.authors, single.data]);
  const counts = useMemo(() => authors.map((a) => a.stories.length), [authors]);
  const loading = isMine ? mine.isLoading : inFeed ? false : single.isLoading;
  const fetched = isMine ? mine.isFetched : inFeed || single.isFetched;
  const viewCountOf = (id: string) =>
    mine.data?.stories.find((s) => s.id === id)?.viewCount ?? 0;

  const [position, setPosition] = useState<StoryPosition | null>(null);
  const [restart, setRestart] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retried, setRetried] = useState(false);
  const [holding, setHolding] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  // The story whose viewer list is open (loads only then)
  const [viewersFor, setViewersFor] = useState<string | null>(null);
  const [replying, setReplying] = useState(false);
  // At an iOS cold start (and in tests) the state can be 'unknown': start
  // running unless backgrounded; the listener then pauses on anything but
  // 'active' (Control Center, the app switcher)
  const [appActive, setAppActive] = useState(
    AppState.currentState !== 'background' &&
      AppState.currentState !== 'inactive',
  );

  const close = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [router]);

  // Open at the chosen author's first unseen story
  useEffect(() => {
    if (position || authors.length === 0) return;
    const authorIndex = Math.max(
      0,
      authors.findIndex((a) => a.author.identityId === authorId),
    );
    const author = authors[authorIndex];
    setPosition({
      authorIndex,
      storyIndex: Math.min(author.firstUnseenIndex, author.stories.length - 1),
    });
  }, [authors, authorId, position]);

  // Nothing to show (none left, or not signed in): close
  useEffect(() => {
    if (!loading && authors.length === 0 && (fetched || !identityId)) {
      close();
    }
  }, [authors.length, close, identityId, fetched, loading]);

  // Another profile: its stories and seen state are not this one's
  useEffect(() => {
    if (identityId !== openedAs.current) close();
  }, [identityId, close]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) =>
      setAppActive(state === 'active'),
    );
    return () => sub.remove();
  }, []);

  const current =
    position && authors[position.authorIndex]
      ? authors[position.authorIndex].stories[position.storyIndex]
      : undefined;
  const author = position ? authors[position.authorIndex] : undefined;

  const go = useCallback(
    (step: StoryStep) => {
      if (step.kind === 'close') {
        close();
        return;
      }
      setPosition((at) => {
        if (
          at &&
          at.authorIndex === step.position.authorIndex &&
          at.storyIndex === step.position.storyIndex
        ) {
          setRestart((n) => n + 1);
        }
        return step.position;
      });
    },
    [close],
  );

  // A list that shrank (a story expired or was deleted): stay in range
  useEffect(() => {
    if (!position || authors.length === 0) return;
    if (!authors[position.authorIndex]) {
      setPosition({ authorIndex: authors.length - 1, storyIndex: 0 });
    } else if (!authors[position.authorIndex].stories[position.storyIndex]) {
      setPosition({ authorIndex: position.authorIndex, storyIndex: 0 });
    }
  }, [authors, position]);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
    setRetried(false);
  }, [current?.id]);

  const running =
    !!current &&
    loaded &&
    isFocused &&
    appActive &&
    !holding &&
    !sheetOpen &&
    !replying;

  const isVideo = current?.mediaType === 'VIDEO';
  const progress = useStoryTimer({
    // A video's clock is its measured length, and only runs while it plays
    durationMs: isVideo
      ? (current?.durationMs ?? STORY_VIDEO_FALLBACK_MS)
      : STORY_IMAGE_MS,
    running,
    resetKey: `${current?.id ?? ''}:${restart}`,
    onDone: () => position && go(nextStory(position, counts)),
  });

  // Counts as viewed after a second on screen (a video: a second played)
  const watching = isVideo ? running : loaded;
  useEffect(() => {
    if (isMine || !current || !watching || current.viewed) return undefined;
    const id = current.id;
    const timer = setTimeout(() => {
      queue.add(id);
      markViewed(id);
    }, STORY_VIEW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [isMine, current, watching, queue, markViewed]);

  // The next photos (a video's poster), in memory only
  useEffect(() => {
    if (!position) return;
    const upcoming = [
      authors[position.authorIndex]?.stories[position.storyIndex + 1],
      authors[position.authorIndex + 1]?.stories[firstUnseen(authors[position.authorIndex + 1])],
    ].flatMap((s) => {
      if (!s) return [];
      if (s.mediaType !== 'VIDEO') return [s.mediaUrl];
      return s.posterUrl ? [s.posterUrl] : [];
    });
    if (upcoming.length) void Image.prefetch(upcoming, 'memory');
  }, [authors, position]);

  const startAt = (i: number) => firstUnseen(authors[i]);

  const onTap = (side: TapSide) => {
    if (!position) return;
    go(
      tapAction(side, I18nManager.isRTL) === 'next'
        ? nextStory(position, counts)
        : previousStory(position, counts),
    );
  };

  const onSwipe = (dx: number, dy: number) => {
    if (!position) return;
    const action = swipeAction(dx, dy, I18nManager.isRTL);
    if (action === 'close') close();
    else if (action === 'nextAuthor') go(nextAuthor(position, counts, startAt));
    else if (action === 'previousAuthor') go(previousAuthor(position, startAt));
  };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(20)
    .onEnd((e) => onSwipe(e.translationX, e.translationY));

  // A link that expired (or a story gone): fetch fresh links once
  const onImageError = () => {
    if (retried) {
      setFailed(true);
      return;
    }
    setRetried(true);
    void (isMine ? mine.refetch() : inFeed ? feed.refetch() : single.refetch());
  };

  const deleteCurrent = async () => {
    if (!current) return;
    try {
      await storiesService.remove(current.id);
      await mine.refetch();
    } catch (error) {
      const message = (error as { response?: { data?: { message?: unknown } } })
        ?.response?.data?.message;
      showAlert('خطأ', typeof message === 'string' ? message : 'تعذر حذف القصة');
    } finally {
      setSheetOpen(false);
    }
  };

  const reply = async () => {
    if (!author || !current) return;
    setReplying(true);
    try {
      const conversation = await chatService.createConversation(
        author.author.identityId,
        current.property?.id,
      );
      router.push(`/chat/${conversation.id}` as never);
    } catch (error) {
      const message = (error as { response?: { data?: { message?: unknown } } })
        ?.response?.data?.message;
      showAlert(
        'تنبيه',
        typeof message === 'string' ? message : 'تعذر بدء المحادثة',
      );
    } finally {
      setReplying(false);
    }
  };

  const submitReport = async (reason: string, description?: string) => {
    if (!current) return;
    try {
      await storiesService.report(current.id, reason, description);
      showAlert('تم الإرسال', 'تم إرسال البلاغ بنجاح وسيقوم فريق الدعم بمراجعته.');
    } catch (error) {
      const message = (error as { response?: { data?: { message?: unknown } } })
        ?.response?.data?.message;
      showAlert('خطأ', typeof message === 'string' ? message : 'تعذر إرسال البلاغ');
    }
  };

  if (!current || !author || !position) {
    return (
      <View className="flex-1 items-center justify-center bg-black" testID="story-loading">
        <StatusBar style="light" />
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  const sides: [TapSide, TapSide] = I18nManager.isRTL
    ? ['right', 'left']
    : ['left', 'right'];

  return (
    <View className="flex-1 bg-black" testID="story-viewer">
      <StatusBar style="light" />
      <GestureDetector gesture={pan}>
        <View className="flex-1">
          {isVideo ? (
            <StoryVideo
              key={current.id}
              url={current.mediaUrl}
              posterUrl={current.posterUrl}
              playing={running}
              restartKey={restart}
              onReady={() => setLoaded(true)}
              onWaiting={() => setLoaded(false)}
              onError={onImageError}
            />
          ) : (
            <Image
              testID="story-image"
              source={{ uri: current.mediaUrl }}
              // Memory only: story media must not stay on the phone's disk
              cachePolicy="memory"
              contentFit="contain"
              recyclingKey={current.id}
              style={StyleSheet.absoluteFill}
              onLoad={() => setLoaded(true)}
              onError={onImageError}
            />
          )}
          {!loaded && !failed && (
            <View style={StyleSheet.absoluteFill} className="items-center justify-center" pointerEvents="none">
              <ActivityIndicator color="#FFFFFF" />
            </View>
          )}
          {failed && (
            <View style={StyleSheet.absoluteFill} className="items-center justify-center" pointerEvents="none">
              <Text className="font-cairo-medium text-[14px] text-white">
                تعذر تحميل القصة
              </Text>
            </View>
          )}

          {/* Tap zones: one per half, in the app's direction */}
          <View style={StyleSheet.absoluteFill} className="flex-row">
            {sides.map((side) => (
              <Pressable
                key={side}
                testID={`story-tap-${side}`}
                style={{ flex: 1 }}
                delayLongPress={200}
                onPress={() => onTap(side)}
                onLongPress={() => setHolding(true)}
                onPressOut={() => setHolding(false)}
              />
            ))}
          </View>

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
              onReply={() => void reply()}
              onOpenProperty={(id) => router.push(`/property/${id}` as never)}
              own={
                isMine
                  ? {
                      viewCount: viewCountOf(current.id),
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

      {isMine ? (
        <>
          <StoryViewersSheet
            ref={viewersSheet}
            storyId={viewersFor}
            onClose={() => {
              setViewersFor(null);
              setSheetOpen(false);
            }}
          />
          <ConfirmActionSheet
            ref={deleteSheet}
            variant="danger"
            icon={<WarningTriangleIcon color="#15304D" />}
            iconBackground="#F9FAFE"
            title="حذف القصة؟"
            description="ستختفي القصة من حسابك ومن قصص المتابعين فوراً."
            confirmLabel="حذف"
            onConfirm={() => void deleteCurrent()}
            onCancel={() => setSheetOpen(false)}
          />
        </>
      ) : (
        <ReportReasonSheet
          ref={reportSheet}
          onSubmit={(reason, description) => void submitReport(reason, description)}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </View>
  );
}
