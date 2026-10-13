import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { SafeImage } from '@/shared/components/ui/SafeImage';
import { cachedImageSource } from '@/shared/utils/chatMediaCache';

import {
  clampScale,
  clampTranslate,
  DISMISS_DISTANCE,
  doubleTapTarget,
  MAX_SCALE,
  MIN_SCALE,
  translateForFocal,
} from './zoom';

const SPRING = { damping: 18, stiffness: 180 };

export interface ZoomableImageProps {
  uri: string;
  width: number;
  height: number;
  // Not the page on screen: zoom resets when the user pages away
  isActive: boolean;
  onZoomChange: (zoomed: boolean) => void;
  onSingleTap: () => void;
  // 0..1 while dragging down at 1x (fades the backdrop)
  onDismissProgress: (progress: number) => void;
  onDismiss: () => void;
}

/**
 * One photo in the viewer: pinch (1x-4x, around the fingers), double-tap to
 * zoom in/out at the tapped point, pan while zoomed (kept inside the photo),
 * and at 1x drag down to close.
 */
export default function ZoomableImage({
  uri,
  width,
  height,
  isActive,
  onZoomChange,
  onSingleTap,
  onDismissProgress,
  onDismiss,
}: ZoomableImageProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  const dismissY = useSharedValue(0);
  // Pan-to-move only while zoomed; at 1x a vertical drag closes instead and
  // horizontal swipes page the list
  const [zoomed, setZoomed] = useState(false);
  // A spinner until the photo is in (or has failed), so a slow full-size
  // download is never just a black screen
  const [loading, setLoading] = useState(true);

  const reportZoom = (next: boolean) => {
    setZoomed(next);
    onZoomChange(next);
  };

  // Paged away: back to 1x for when the user returns
  useEffect(() => {
    if (isActive) return;
    scale.value = 1;
    savedScale.value = 1;
    tx.value = 0;
    ty.value = 0;
    savedTx.value = 0;
    savedTy.value = 0;
    if (zoomed) reportZoom(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const settle = (toScale: number, toX: number, toY: number) => {
    'worklet';
    scale.value = withSpring(toScale, SPRING);
    tx.value = withSpring(toX, SPRING);
    ty.value = withSpring(toY, SPRING);
    savedScale.value = toScale;
    savedTx.value = toX;
    savedTy.value = toY;
    runOnJS(reportZoom)(toScale > MIN_SCALE);
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      // A little give past the limits, settled back on release
      const next = Math.min(
        MAX_SCALE * 1.25,
        Math.max(MIN_SCALE * 0.8, savedScale.value * e.scale),
      );
      tx.value = translateForFocal(
        e.focalX,
        width,
        savedScale.value,
        savedTx.value,
        next,
      );
      ty.value = translateForFocal(
        e.focalY,
        height,
        savedScale.value,
        savedTy.value,
        next,
      );
      scale.value = next;
    })
    .onEnd(() => {
      const target = clampScale(scale.value);
      if (target <= MIN_SCALE) {
        settle(MIN_SCALE, 0, 0);
        return;
      }
      settle(
        target,
        clampTranslate(tx.value, target, width),
        clampTranslate(ty.value, target, height),
      );
    });

  const panZoomed = Gesture.Pan()
    .enabled(zoomed)
    .onUpdate((e) => {
      tx.value = clampTranslate(
        savedTx.value + e.translationX,
        scale.value,
        width,
      );
      ty.value = clampTranslate(
        savedTy.value + e.translationY,
        scale.value,
        height,
      );
    })
    .onEnd(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  const panDismiss = Gesture.Pan()
    .enabled(!zoomed)
    // Vertical only: horizontal swipes are left to the pager
    .activeOffsetY([-12, 12])
    .failOffsetX([-18, 18])
    .onUpdate((e) => {
      dismissY.value = Math.max(0, e.translationY);
      runOnJS(onDismissProgress)(
        Math.min(1, dismissY.value / (DISMISS_DISTANCE * 2)),
      );
    })
    .onEnd(() => {
      if (dismissY.value > DISMISS_DISTANCE) {
        dismissY.value = withTiming(height, { duration: 160 });
        runOnJS(onDismiss)();
      } else {
        dismissY.value = withSpring(0, SPRING);
        runOnJS(onDismissProgress)(0);
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      const target = doubleTapTarget(scale.value, e.x, e.y, width, height);
      settle(target.scale, target.x, target.y);
    });

  const singleTap = Gesture.Tap().onEnd(() => {
    runOnJS(onSingleTap)();
  });

  const gesture = Gesture.Simultaneous(
    pinch,
    panZoomed,
    panDismiss,
    Gesture.Exclusive(doubleTap, singleTap),
  );

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value + dismissY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[{ width, height }, style]}>
        <SafeImage
          source={cachedImageSource(uri)}
          style={{ width, height }}
          contentFit="contain"
          accessibilityIgnoresInvertColors
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
        />
        {loading && (
          <View
            testID="zoomable-image-loading"
            pointerEvents="none"
            style={{ position: 'absolute', width, height }}
            className="items-center justify-center"
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}
