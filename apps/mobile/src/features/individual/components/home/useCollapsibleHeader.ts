import { useCallback, useMemo, useRef } from 'react';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const SNAP = { duration: 180, easing: Easing.out(Easing.cubic) };

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;

export interface CollapsibleScrollHandlers {
  onScroll: (e: ScrollEvent) => void;
  onScrollEndDrag: (e: ScrollEvent) => void;
  onMomentumScrollEnd: (e: ScrollEvent) => void;
  scrollEventThrottle: number;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

/**
 * How far the block has slid away (0 shown … blockHeight hidden) after a
 * scroll from `prevY` to `y`, as on Facebook: it moves with the finger, by
 * as much as the list scrolled. The bounce past either end (pull-to-refresh,
 * end of list) doesn't count, and it never hides further than the list has
 * scrolled, so at the top it's all there.
 */
export function nextOffset(
  offset: number,
  prevY: number,
  y: number,
  maxY: number,
  blockHeight: number,
): number {
  const end = Math.max(maxY, 0);
  const from = clamp(prevY, 0, end);
  const to = clamp(y, 0, end);
  return Math.min(clamp(offset + to - from, 0, blockHeight), to);
}

/** Where it settles once the list stops: all the way, whichever is nearer. */
export function snapOffset(
  offset: number,
  y: number,
  blockHeight: number,
): number {
  return offset > blockHeight / 2 && y >= blockHeight ? blockHeight : 0;
}

/**
 * A header block that slides away with the list under it scrolling down and
 * back with it scrolling up, then settles shown or hidden when it stops.
 */
export function useCollapsibleHeader() {
  const height = useSharedValue(0);
  const offset = useSharedValue(0);
  // The last scroll position seen; null after a reset (the next one sets it)
  const lastY = useRef<number | null>(null);

  // For the block's content, laid out on its own inside the collapsing view
  // (absolutely), so it keeps its full size and reports it, which changes
  // with the tab. Squeezed with the view, it would shrink the lists' room
  // for the header, moving them, which scrolls them, which slides it more
  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      height.value = e.nativeEvent.layout.height;
    },
    [height],
  );

  const onScroll = useCallback(
    (e: ScrollEvent) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      const y = contentOffset.y;
      if (lastY.current !== null) {
        offset.value = nextOffset(
          offset.value,
          lastY.current,
          y,
          contentSize.height - layoutMeasurement.height,
          height.value,
        );
      }
      lastY.current = y;
    },
    [height, offset],
  );

  const settle = useCallback(
    (e: ScrollEvent) => {
      offset.value = withTiming(
        snapOffset(offset.value, e.nativeEvent.contentOffset.y, height.value),
        SNAP,
      );
    },
    [height, offset],
  );

  const scrollHandlers = useMemo<CollapsibleScrollHandlers>(
    () => ({
      onScroll,
      // A drag let go without a fling settles here; a fling, once it stops
      // (its scrolling takes over from this one meanwhile)
      onScrollEndDrag: settle,
      onMomentumScrollEnd: settle,
      scrollEventThrottle: 16,
    }),
    [onScroll, settle],
  );

  const show = useCallback(() => {
    lastY.current = null;
    offset.value = withTiming(0, SNAP);
  }, [offset]);

  // The view clips to what's left; the content slides up inside it
  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value - offset.value,
    overflow: 'hidden',
  }));
  const contentStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    transform: [{ translateY: -offset.value }],
  }));
  // A background behind the header, gone with the block
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: height.value === 0 ? 1 : 1 - offset.value / height.value,
  }));

  return {
    scrollHandlers,
    onLayout,
    animatedStyle,
    contentStyle,
    backgroundStyle,
    show,
  };
}
