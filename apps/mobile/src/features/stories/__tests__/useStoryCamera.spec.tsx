import { act, cleanup, render } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { showAlert } from '@/shared/utils/alert';

import {
  clampZoom,
  useStoryCamera,
} from '../components/camera/useStoryCamera';
import { cropToStoryFrame } from '../storyFrame';

let mockMic = { granted: true, canAskAgain: true };
jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  useCameraPermissions: () => [{ granted: true, canAskAgain: true }, jest.fn()],
  useMicrophonePermissions: () => [mockMic, jest.fn()],
}));
jest.mock('expo', () => ({ requireOptionalNativeModule: () => ({}) }));
jest.mock('../storyFrame', () => ({
  cropToStoryFrame: jest.fn(async (uri: string) => ({
    uri: `${uri}#9x16`,
    width: 1080,
    height: 1920,
  })),
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const camera = {
  takePictureAsync: jest.fn(),
  recordAsync: jest.fn(),
  stopRecording: jest.fn(),
};
const onCaptured = jest.fn();
const hook = { current: null as unknown as ReturnType<typeof useStoryCamera> };

function Harness() {
  hook.current = useStoryCamera(onCaptured);
  // The CameraView's ref, as the screen would set it
  (hook.current.cameraRef as { current: unknown }).current = camera;
  return null;
}

const originalOS = Platform.OS;
const setOS = (os: typeof Platform.OS) => {
  Object.defineProperty(Platform, 'OS', { value: os, configurable: true });
};

describe('useStoryCamera', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMic = { granted: true, canAskAgain: true };
    setOS('ios');
  });
  afterEach(() => {
    cleanup();
    setOS(originalOS);
  });

  it('a tap takes a photo, cropped to 9:16', async () => {
    camera.takePictureAsync.mockResolvedValue({
      uri: 'file:///p.jpg',
      width: 3024,
      height: 4032,
    });
    await render(<Harness />);

    await act(async () => {
      await hook.current.takePhoto();
    });

    expect(camera.takePictureAsync).toHaveBeenCalledWith({ quality: 0.85 });
    expect(cropToStoryFrame).toHaveBeenCalledWith('file:///p.jpg', 3024, 4032);
    expect(onCaptured).toHaveBeenCalledWith({
      kind: 'photo',
      uri: 'file:///p.jpg#9x16',
      width: 1080,
      height: 1920,
    });
  });

  it('a hold records up to 30 s; letting go stops it and hands the video on', async () => {
    let finish!: (v: { uri: string }) => void;
    camera.recordAsync.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const now = jest.spyOn(Date, 'now').mockReturnValue(10_000);
    await render(<Harness />);

    // iOS records straight away (already in video mode)
    expect(hook.current.mode).toBe('video');
    await act(async () => {
      hook.current.startRecording();
    });
    expect(camera.recordAsync).toHaveBeenCalledWith({ maxDuration: 30 });
    expect(hook.current.recording).toBe(true);

    await act(async () => {
      hook.current.stopRecording();
    });
    expect(camera.stopRecording).toHaveBeenCalled();

    now.mockReturnValue(14_500);
    await act(async () => {
      finish({ uri: 'file:///v.mov' });
    });
    expect(onCaptured).toHaveBeenCalledWith({
      kind: 'video',
      uri: 'file:///v.mov',
      durationMs: 4500,
    });
    expect(hook.current.recording).toBe(false);
    now.mockRestore();
  });

  it('a hold under a second is no video', async () => {
    camera.recordAsync.mockResolvedValue({ uri: 'file:///v.mov' });
    const now = jest.spyOn(Date, 'now').mockReturnValue(10_000);
    await render(<Harness />);

    await act(async () => {
      hook.current.startRecording();
    });

    expect(onCaptured).not.toHaveBeenCalled();
    expect(showAlert).toHaveBeenCalledWith(
      'تنبيه',
      'اضغط مطولاً لتسجيل فيديو، أو اضغط مرة لالتقاط صورة',
    );
    now.mockRestore();
  });

  it('flash goes off → auto → on; the light stays on only while recording with it on', async () => {
    let finish!: (v: { uri: string }) => void;
    camera.recordAsync.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    await render(<Harness />);
    expect(hook.current.flash).toBe('off');
    await act(async () => hook.current.cycleFlash());
    expect(hook.current.flash).toBe('auto');
    await act(async () => hook.current.cycleFlash());
    expect(hook.current.flash).toBe('on');
    expect(hook.current.torch).toBe(false);

    await act(async () => {
      hook.current.startRecording();
    });
    expect(hook.current.torch).toBe(true);
    await act(async () => {
      finish({ uri: '' });
    });
    await act(async () => hook.current.cycleFlash());
    expect(hook.current.flash).toBe('off');
  });

  it('flips front/back (resetting zoom), but not while recording', async () => {
    camera.recordAsync.mockReturnValue(new Promise(() => {}));
    await render(<Harness />);
    await act(async () => hook.current.setZoom(0.5));
    await act(async () => hook.current.flip());
    expect(hook.current.facing).toBe('front');
    expect(hook.current.zoom).toBe(0);

    await act(async () => {
      hook.current.startRecording();
    });
    await act(async () => hook.current.flip());
    expect(hook.current.facing).toBe('front');
  });

  it('keeps zoom between 0 and 1', () => {
    expect(clampZoom(-0.3)).toBe(0);
    expect(clampZoom(0.4)).toBe(0.4);
    expect(clampZoom(1.7)).toBe(1);
  });

  it('records silently without the microphone', async () => {
    mockMic = { granted: false, canAskAgain: false };
    await render(<Harness />);
    expect(hook.current.mute).toBe(true);
  });

  describe('Android (switches to video mode for a hold)', () => {
    beforeEach(() => setOS('android'));

    it('waits in picture mode, then records once video mode is ready', async () => {
      camera.recordAsync.mockReturnValue(new Promise(() => {}));
      await render(<Harness />);
      expect(hook.current.mode).toBe('picture');

      await act(async () => {
        hook.current.startRecording();
      });
      expect(hook.current.mode).toBe('video');
      expect(camera.recordAsync).not.toHaveBeenCalled();

      await act(async () => {
        hook.current.onCameraReady();
      });
      expect(camera.recordAsync).toHaveBeenCalled();
    });

    it('let go before it was ready: no video, back to picture mode', async () => {
      await render(<Harness />);
      await act(async () => {
        hook.current.startRecording();
      });
      await act(async () => {
        hook.current.stopRecording();
      });
      expect(hook.current.mode).toBe('picture');
      await act(async () => {
        hook.current.onCameraReady();
      });
      expect(camera.recordAsync).not.toHaveBeenCalled();
    });
  });
});
