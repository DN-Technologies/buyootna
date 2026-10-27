import { MaterialIcons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { STORY_ASPECT } from '@/features/stories/storyFrame';

import CaptureButton from './CaptureButton';
import { type CapturedStoryMedia, useStoryCamera } from './useStoryCamera';

const FLASH_ICON = {
  off: 'flash-off',
  auto: 'flash-auto',
  on: 'flash-on',
} as const;

const FLASH_LABEL = {
  off: 'الفلاش مطفأ',
  auto: 'الفلاش تلقائي',
  on: 'الفلاش يعمل',
} as const;

interface StoryCameraProps {
  // A photo or video is being prepared (poster, checks)
  preparing: boolean;
  onCaptured: (media: CapturedStoryMedia) => void;
  onPickLibrary: () => void;
  onClose: () => void;
}

/**
 * The story camera, as on Instagram: a full-screen 9:16 live view; tap the
 * shutter for a photo, hold it for a video; flip (or double-tap), flash,
 * pinch or slide up to zoom; the gallery from the corner.
 */
export default function StoryCamera({
  preparing,
  onCaptured,
  onPickLibrary,
  onClose,
}: StoryCameraProps) {
  const insets = useSafeAreaInsets();
  const cam = useStoryCamera(onCaptured);

  // Pinch from the zoom it started at
  const pinchBase = useRef(0);
  const holdBase = useRef(0);
  const pinch = Gesture.Pinch()
    .runOnJS(true)
    .onStart(() => {
      pinchBase.current = cam.zoom;
    })
    .onUpdate((e) => {
      cam.setZoom(pinchBase.current + (e.scale - 1) * 0.5);
    });
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .runOnJS(true)
    .onEnd((_e, success) => {
      if (success) cam.flip();
    });
  const previewGestures = Gesture.Simultaneous(pinch, doubleTap);

  const onHoldStart = useCallback(() => {
    holdBase.current = cam.zoom;
    cam.startRecording();
  }, [cam]);
  const onHoldZoom = useCallback(
    (delta: number) => cam.setZoom(holdBase.current + delta),
    [cam],
  );

  const permission = cam.cameraPermission;
  const denied = permission && !permission.granted && !permission.canAskAgain;

  return (
    <View className="flex-1 bg-black" testID="story-camera">
      <StatusBar style="light" />

      {permission?.granted ? (
        <GestureDetector gesture={previewGestures}>
          {/* The 9:16 story frame, centred; a taller phone has black above
              and below, as on Instagram */}
          <View className="flex-1 items-center justify-center">
            <View
              className="w-full overflow-hidden rounded-[16px]"
              style={{ aspectRatio: STORY_ASPECT, maxHeight: '100%' }}
            >
              <CameraView
                ref={cam.cameraRef}
                style={{ flex: 1 }}
                facing={cam.facing}
                flash={cam.flash}
                enableTorch={cam.torch}
                zoom={cam.zoom}
                mode={cam.mode}
                mute={cam.mute}
                mirror={cam.facing === 'front'}
                videoQuality="720p"
                // Android: a 16:9 sensor frame is the 9:16 story upright
                ratio="16:9"
                onCameraReady={cam.onCameraReady}
              />
            </View>
          </View>
        </GestureDetector>
      ) : (
        <View className="flex-1 items-center justify-center px-8" style={{ gap: 16 }}>
          {permission === null || (!denied && !permission?.granted) ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text
                className="text-center font-cairo-bold text-[16px] text-white"
                style={{ writingDirection: 'rtl' }}
              >
                اسمح للتطبيق باستخدام الكاميرا لإضافة قصة
              </Text>
              <TouchableOpacity
                testID="story-camera-settings"
                onPress={() => void Linking.openSettings()}
                className="rounded-full bg-white px-6 py-3"
              >
                <Text className="font-cairo-bold text-[14px] text-[#111111]">
                  فتح الإعدادات
                </Text>
              </TouchableOpacity>
              <Text
                className="text-center font-cairo text-[13px] text-white/70"
                style={{ writingDirection: 'rtl' }}
              >
                أو اختر صورة أو فيديو من المعرض
              </Text>
            </>
          )}
        </View>
      )}

      {/* Top: close and flash. The app's RTL swaps left and right */}
      <View
        className="absolute flex-row items-center justify-between px-4"
        style={{ top: insets.top + 8, left: 0, right: 0 }}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          testID="composer-close"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="إغلاق"
          className="size-[44px] items-center justify-center rounded-full bg-black/30"
        >
          <MaterialIcons name="close" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        {permission?.granted && (
          <TouchableOpacity
            testID="story-camera-flash"
            onPress={cam.cycleFlash}
            accessibilityRole="button"
            accessibilityLabel={FLASH_LABEL[cam.flash]}
            className="size-[44px] items-center justify-center rounded-full bg-black/30"
          >
            <MaterialIcons name={FLASH_ICON[cam.flash]} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom: gallery, shutter, flip */}
      <View
        className="absolute flex-row items-center justify-between px-8"
        style={{ bottom: insets.bottom + 24, left: 0, right: 0 }}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          testID="story-camera-gallery"
          onPress={onPickLibrary}
          disabled={cam.recording || preparing}
          accessibilityRole="button"
          accessibilityLabel="المعرض"
          className="size-[48px] items-center justify-center rounded-[12px] border-2 border-white bg-black/30"
        >
          <MaterialIcons name="photo-library" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {permission?.granted ? (
          preparing ? (
            <View className="size-[84px] items-center justify-center">
              <ActivityIndicator color="#FFFFFF" />
            </View>
          ) : (
            <CaptureButton
              recording={cam.recording}
              disabled={cam.busy}
              onPhoto={() => void cam.takePhoto()}
              onHoldStart={onHoldStart}
              onHoldEnd={cam.stopRecording}
              onHoldZoom={onHoldZoom}
            />
          )
        ) : (
          <View className="size-[84px]" />
        )}

        <TouchableOpacity
          testID="story-camera-flip"
          onPress={cam.flip}
          disabled={cam.recording || !permission?.granted}
          accessibilityRole="button"
          accessibilityLabel="تبديل الكاميرا"
          className="size-[48px] items-center justify-center rounded-full bg-black/30"
          style={{ opacity: permission?.granted ? 1 : 0 }}
        >
          <MaterialIcons name="flip-camera-ios" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
