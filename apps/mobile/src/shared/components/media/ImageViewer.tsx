import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewToken,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ZoomableImage from './ZoomableImage';

export interface ImageViewerProps {
  images: string[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}

/**
 * Full-screen photos: swipe between them, pinch or double-tap to zoom, drag
 * down (at 1x) or ✕ to close, with an "n / total" counter. A Modal needs its
 * own GestureHandlerRootView for gestures to work on Android.
 */
export default function ImageViewer({
  images,
  initialIndex,
  visible,
  onClose,
}: ImageViewerProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [backdrop, setBackdrop] = useState(1);
  // QA (iOS): the viewer opened black and the photo only appeared after
  // swiping away and back, i.e. once the page was drawn again. The photos
  // are drawn afresh as soon as the modal is fully on screen.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!visible) setShown(false);
  }, [visible]);

  // Each time it opens, start at the tapped photo (the viewer stays mounted,
  // hidden, between openings)
  useEffect(() => {
    if (visible) setIndex(initialIndex);
  }, [visible, initialIndex]);

  // The page on screen. Read from viewability, not scroll offsets, so it's
  // right whatever the layout direction
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first?.index != null) setIndex(first.index);
    },
  ).current;

  const close = useCallback(() => {
    setZoomed(false);
    setBackdrop(1);
    setChromeVisible(true);
    onClose();
  }, [onClose]);

  if (!visible || images.length === 0) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}
      testID="image-viewer-modal"
      onShow={() => setShown(true)}
    >
      <StatusBar barStyle="light-content" />
      <GestureHandlerRootView
        style={{ flex: 1, backgroundColor: `rgba(0,0,0,${backdrop})` }}
        testID="image-viewer"
      >
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          // Fixed left-to-right paging: offsets and the start page behave
          // the same on iOS and Android in the RTL app
          style={{ direction: 'ltr' }}
          scrollEnabled={!zoomed}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          keyExtractor={(uri, i) => `${i}-${uri}`}
          showsHorizontalScrollIndicator={false}
          extraData={shown}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          renderItem={({ item, index: i }) => (
            <View style={{ width, height }} className="items-center justify-center">
              <ZoomableImage
                key={Platform.OS === 'ios' && shown ? 'shown' : 'opening'}
                uri={item}
                width={width}
                height={height}
                isActive={i === index}
                onZoomChange={setZoomed}
                onSingleTap={() => setChromeVisible((v) => !v)}
                onDismissProgress={(p) => setBackdrop(1 - p * 0.8)}
                onDismiss={close}
              />
            </View>
          )}
        />

        {chromeVisible && (
          <View
            pointerEvents="box-none"
            className="absolute left-0 right-0 flex-row items-center justify-between px-4"
            style={{ top: insets.top + 8 }}
          >
            <TouchableOpacity
              testID="image-viewer-close"
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel="إغلاق"
              className="h-10 w-10 items-center justify-center rounded-full bg-black/50"
            >
              <Feather name="x" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            {images.length > 1 && (
              <View className="rounded-full bg-black/50 px-3 py-1.5">
                <Text
                  testID="image-viewer-counter"
                  className="font-cairo-semibold text-sm text-white"
                >
                  {`${index + 1} / ${images.length}`}
                </Text>
              </View>
            )}
          </View>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
}

/**
 * Opens the viewer from anywhere on a screen:
 *   const { open, viewer } = useImageViewer();
 *   <Pressable onPress={() => open(images, i)} /> ... {viewer}
 */
export function useImageViewer() {
  const [state, setState] = useState<{ images: string[]; index: number } | null>(
    null,
  );

  const open = useCallback((images: (string | number)[], index = 0) => {
    // Only real photos (local placeholder assets are numbers)
    const uris = images.filter((i): i is string => typeof i === 'string' && !!i);
    if (uris.length === 0) return;
    setState({ images: uris, index: Math.min(Math.max(0, index), uris.length - 1) });
  }, []);

  const close = useCallback(() => setState(null), []);

  const viewer = (
    <ImageViewer
      images={state?.images ?? []}
      initialIndex={state?.index ?? 0}
      visible={!!state}
      onClose={close}
    />
  );

  return { open, viewer, isOpen: !!state };
}
