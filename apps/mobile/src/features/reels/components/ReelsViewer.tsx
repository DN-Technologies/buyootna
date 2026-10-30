import { Feather } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  type ViewToken,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { STORY_GLASS } from '@/features/stories/components/composer/storyGlass';
import { StoryViewQueue } from '@/features/stories/storyViewQueue';
import { reelsService } from '@/shared/api/reels.service';
import AuthGuardSheet from '@/shared/components/auth/AuthGuardSheet';
import ReportReasonSheet from '@/shared/components/report/ReportReasonSheet';
import { getIdentityHomeRoute } from '@/shared/navigation/getIdentityHomeRoute';
import { useAuthStore } from '@/shared/store/useAuthStore';

import { useReelActions } from '../hooks/useReelActions';
import { useReelPlayers } from '../hooks/useReelPlayers';
import { useReelsSession } from '../hooks/useReelsSession';
import { reachedView } from '../reelRules';
import type { ViewerReel } from '../types';
import ReelItem from './ReelItem';

// Fetch more this many reels before the end
const LOAD_AHEAD = 3;
const VIEWABILITY = { itemVisiblePercentThreshold: 60 };

/**
 * The full-screen reels viewer: the main feed, or one author's reels when
 * `authorId` is given, swiped up and down. The list only renders the reels
 * near the one on screen, and three players are shared between them
 * (useReelPlayers). The video stops whenever the screen is left, the app goes
 * to the background or a sheet is up.
 */
export default function ReelsViewer({
  authorId,
  startId,
}: {
  authorId?: string;
  startId?: string;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const token = useAuthStore((s) => s.token);
  const session = useReelsSession({ authorId, startId });
  const { items, startIndex, loadMore } = session;

  const [height, setHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [appActive, setAppActive] = useState(
    AppState.currentState === 'active',
  );
  const progress = useSharedValue(0);

  // The root layout keeps a dark status bar for the app's white screens, and
  // wins over a <StatusBar> here
  useEffect(() => {
    if (!focused) return;
    setStatusBarStyle('light');
    return () => setStatusBarStyle('dark');
  }, [focused]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) =>
      setAppActive(state === 'active'),
    );
    return () => sub.remove();
  }, []);

  // Opening at a reel further down the list
  const opened = useRef(false);
  useEffect(() => {
    if (!session.loading && !opened.current) {
      opened.current = true;
      setActiveIndex(startIndex);
    }
  }, [session.loading, startIndex]);

  const close = useCallback(() => {
    if (router.canGoBack()) router.back();
    // Opened by a link, with nothing beneath. Straight to home: '/' is the
    // launch route, and from inside this modal it never gets past launch
    else {
      router.replace(
        getIdentityHomeRoute(useAuthStore.getState().activeIdentity?.type),
      );
    }
  }, [router]);

  // Guests' views aren't counted: they can't be told apart
  const queue = useMemo(
    () =>
      token ? new StoryViewQueue((ids) => reelsService.recordViews(ids)) : null,
    [token],
  );
  useEffect(
    () => () => {
      void queue?.flush().finally(() => queue.dispose());
    },
    [queue],
  );

  const onTime = useCallback(
    (reel: ViewerReel, seconds: number, duration: number) => {
      progress.value = duration > 0 ? seconds / duration : 0;
      if (reachedView(seconds, duration)) queue?.add(reel.id);
    },
    [progress, queue],
  );

  const playing = focused && appActive && !paused && !sheetOpen;
  const players = useReelPlayers({
    items,
    activeIndex,
    playing,
    muted,
    onTime,
  });

  const actions = useReelActions({
    update: session.update,
    removeWhere: session.removeWhere,
    setSheetOpen,
  });

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const index = viewableItems[0]?.index;
      if (typeof index === 'number') setActiveIndex(index);
    },
  ).current;

  // A new reel on screen starts playing, whatever the last one was doing
  useEffect(() => {
    setPaused(false);
    progress.value = 0;
    if (activeIndex >= items.length - LOAD_AHEAD && items.length > 0) {
      void loadMore();
    }
  }, [activeIndex, items.length, loadMore, progress]);

  const header = (
    <View
      className="absolute end-0 start-0 top-0 flex-row items-center justify-between px-[12px]"
      style={{ paddingTop: insets.top + 8 }}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        testID="reels-close"
        onPress={close}
        accessibilityLabel="إغلاق"
        className="size-[40px] items-center justify-center rounded-full"
        style={STORY_GLASS}
      >
        <Image
          source={require('@/assets/icons/stories/chevron.svg')}
          // Points back the way the text reads, as in the stories viewer
          style={{ width: 20, height: 20, transform: [{ scaleX: -1 }] }}
          contentFit="contain"
        />
      </TouchableOpacity>
      <Text className="font-cairo-bold text-[18px] text-white">ريلز</Text>
      <TouchableOpacity
        testID="reels-mute"
        onPress={() => setMuted((m) => !m)}
        accessibilityLabel={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
        className="size-[40px] items-center justify-center rounded-full"
        style={STORY_GLASS}
      >
        <Feather
          name={muted ? 'volume-x' : 'volume-2'}
          size={20}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </View>
  );

  let body: React.ReactNode;
  if (session.loading || height === 0) {
    body = (
      <View
        className="flex-1 items-center justify-center"
        testID="reels-loading"
      >
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  } else if (items.length === 0) {
    body = (
      <View className="flex-1 items-center justify-center" style={{ gap: 14 }}>
        <Text className="font-cairo text-[14px] text-white">
          {session.failed ? 'تعذر تحميل الفيديوهات' : 'لا توجد فيديوهات حالياً'}
        </Text>
        {session.failed && (
          <TouchableOpacity
            testID="reels-retry"
            onPress={() => void session.retry()}
            activeOpacity={0.8}
            className="h-[42px] items-center justify-center rounded-full px-[22px]"
            style={STORY_GLASS}
          >
            <Text className="font-cairo-semibold text-[14px] text-white">
              إعادة المحاولة
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  } else {
    body = (
      <FlatList
        testID="reels-list"
        data={items}
        keyExtractor={(r) => r.id}
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={height}
        snapToAlignment="start"
        disableIntervalMomentum
        showsVerticalScrollIndicator={false}
        initialScrollIndex={startIndex}
        getItemLayout={(_d, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
        // Only the reels around the one on screen
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={false}
        viewabilityConfig={VIEWABILITY}
        onViewableItemsChanged={onViewableItemsChanged}
        extraData={[activeIndex, paused, players.statuses]}
        renderItem={({ item, index }) => (
          <ReelItem
            reel={item}
            height={height}
            player={players.playerFor(index)}
            active={index === activeIndex}
            status={players.statuses[item.id]}
            paused={paused}
            progress={progress}
            onTogglePause={() => setPaused((p) => !p)}
            onRetry={() => players.retry(item.id)}
            onDoubleTap={() => actions.like(item)}
            onLike={() => void actions.toggleLike(item)}
            onMessage={() => void actions.message(item)}
            onShare={() => void actions.share(item)}
            onOptions={() => actions.options(item)}
            onOpenProfile={() => actions.openProfile(item)}
            onOpenListing={actions.openListing}
          />
        )}
      />
    );
  }

  return (
    <View
      testID="reels-viewer"
      className="flex-1 bg-black"
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
    >
      {body}
      {header}
      <ReportReasonSheet
        ref={actions.reportSheet}
        onSubmit={(reason, description) =>
          void actions.submitReport(reason, description)
        }
        onClose={actions.onReportClosed}
      />
      <AuthGuardSheet ref={actions.authSheetRef} />
    </View>
  );
}
