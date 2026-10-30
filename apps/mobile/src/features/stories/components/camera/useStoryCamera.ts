import { requireOptionalNativeModule } from 'expo';
import {
  type CameraMode,
  type CameraType,
  type CameraView,
  type FlashMode,
  useCameraPermissions,
  useMicrophonePermissions,
} from 'expo-camera';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { cropToStoryFrame } from '@/features/stories/storyFrame';
import { STORY_VIDEO_MAX_MS } from '@/features/stories/storyPhoto';
import { STORY_TRIM_MIN_MS } from '@/features/stories/videoEditor';
import { showAlert } from '@/shared/utils/alert';

export type CapturedStoryMedia =
  | { kind: 'photo'; uri: string; width: number; height: number }
  | { kind: 'video'; uri: string; durationMs: number };

/** Whether this app build has the in-app camera (1.7.0 and later). */
export function hasStoryCamera(): boolean {
  return requireOptionalNativeModule('ExpoCamera') != null;
}

// iOS takes photos while set up for video, so it stays in video mode (a
// tap and a hold are both instant). Android can't: it waits in picture
// mode and switches to video for a hold
const idleMode = (): CameraMode => (Platform.OS === 'ios' ? 'video' : 'picture');

const FLASH_ORDER: FlashMode[] = ['off', 'auto', 'on'];

export const clampZoom = (zoom: number) => Math.min(1, Math.max(0, zoom));

/**
 * The story camera's state and actions: what's allowed, front/back, flash,
 * zoom, a photo (cropped to 9:16) and a video up to the story limit.
 */
export function useStoryCamera(
  onCaptured: (media: CapturedStoryMedia) => void,
  {
    maxMs = STORY_VIDEO_MAX_MS,
    videoOnly = false,
  }: { maxMs?: number; videoOnly?: boolean } = {},
) {
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCamera] = useCameraPermissions();
  const [micPermission, requestMic] = useMicrophonePermissions();

  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [zoom, setZoomState] = useState(0);
  const [mode, setMode] = useState<CameraMode>(idleMode);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const recordStartedAt = useRef(0);
  // Android: the hold began, recording starts once video mode is ready
  const waitingToRecord = useRef(false);

  // Ask once on opening: the camera, then the microphone (a video without
  // it records silently)
  useEffect(() => {
    if (cameraPermission && !cameraPermission.granted && cameraPermission.canAskAgain) {
      void requestCamera();
    }
  }, [cameraPermission, requestCamera]);
  useEffect(() => {
    if (
      cameraPermission?.granted &&
      micPermission &&
      !micPermission.granted &&
      micPermission.canAskAgain
    ) {
      void requestMic();
    }
  }, [cameraPermission?.granted, micPermission, requestMic]);

  const setZoom = useCallback((value: number) => setZoomState(clampZoom(value)), []);

  const flip = useCallback(() => {
    if (recording) return;
    setFacing((f) => (f === 'back' ? 'front' : 'back'));
    setZoomState(0);
  }, [recording]);

  const cycleFlash = useCallback(() => {
    setFlash((f) => FLASH_ORDER[(FLASH_ORDER.indexOf(f) + 1) % FLASH_ORDER.length]);
  }, []);

  const takePhoto = useCallback(async () => {
    const camera = cameraRef.current;
    if (!camera || busy || recording) return;
    if (videoOnly) {
      showAlert('تنبيه', 'اضغط مطولاً لتسجيل فيديو');
      return;
    }
    setBusy(true);
    try {
      const picture = await camera.takePictureAsync({ quality: 0.85 });
      const framed = await cropToStoryFrame(picture.uri, picture.width, picture.height);
      onCaptured({ kind: 'photo', ...framed });
    } catch {
      showAlert('تنبيه', 'تعذر التقاط الصورة، حاول مرة أخرى');
    } finally {
      setBusy(false);
    }
  }, [busy, recording, onCaptured, videoOnly]);

  const record = useCallback(async () => {
    const camera = cameraRef.current;
    if (!camera) return;
    setRecording(true);
    recordStartedAt.current = Date.now();
    try {
      const result = await camera.recordAsync({
        maxDuration: maxMs / 1000,
      });
      const durationMs = Math.min(Date.now() - recordStartedAt.current, maxMs);
      if (!result?.uri) return;
      if (durationMs < STORY_TRIM_MIN_MS) {
        showAlert(
          'تنبيه',
          videoOnly
            ? 'اضغط مطولاً لتسجيل فيديو'
            : 'اضغط مطولاً لتسجيل فيديو، أو اضغط مرة لالتقاط صورة',
        );
        return;
      }
      onCaptured({ kind: 'video', uri: result.uri, durationMs });
    } catch {
      showAlert('تنبيه', 'تعذر تسجيل الفيديو، حاول مرة أخرى');
    } finally {
      setRecording(false);
      // Android goes back to picture mode (a no-op on iOS)
      setMode(idleMode());
    }
  }, [maxMs, onCaptured, videoOnly]);

  const startRecording = useCallback(() => {
    if (busy || recording) return;
    if (mode !== 'video') {
      // Android: switch, then record from onCameraReady
      waitingToRecord.current = true;
      setMode('video');
      return;
    }
    void record();
  }, [busy, recording, mode, record]);

  const stopRecording = useCallback(() => {
    if (waitingToRecord.current) {
      // Let go before the camera was ready: no video
      waitingToRecord.current = false;
      setMode(idleMode());
      return;
    }
    cameraRef.current?.stopRecording();
  }, []);

  const onCameraReady = useCallback(() => {
    if (waitingToRecord.current && mode === 'video') {
      waitingToRecord.current = false;
      void record();
    }
  }, [mode, record]);

  return {
    cameraRef,
    cameraPermission,
    requestCamera,
    // No microphone: videos record silently
    mute: !micPermission?.granted,
    facing,
    flip,
    flash,
    cycleFlash,
    // Video: the light stays on while recording with the flash on
    torch: recording && flash === 'on',
    zoom,
    setZoom,
    mode,
    recording,
    busy,
    takePhoto,
    startRecording,
    stopRecording,
    onCameraReady,
  };
}
