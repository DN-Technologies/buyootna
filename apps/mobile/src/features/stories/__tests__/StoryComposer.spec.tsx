import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { getInfoAsync } from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';

import { storiesService } from '@/shared/api/stories.service';
import { userService } from '@/shared/api/user.service';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { showPermissionDenied } from '@/shared/utils/permissionDenied';

import StoryComposer from '../components/StoryComposer';

jest.mock('@gorhom/bottom-sheet');
const mockRouter = { back: jest.fn(), push: jest.fn(), replace: jest.fn(), canGoBack: () => true };
jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  UIImagePickerPreferredAssetRepresentationMode: { Compatible: 'compatible' },
  VideoExportPreset: { H264_1280x720: 6 },
}));
jest.mock('expo-video-thumbnails', () => ({ getThumbnailAsync: jest.fn() }));
// The preview's player: what it's told, not the native video
const mockPlayer = {
  play: jest.fn(),
  pause: jest.fn(),
  muted: false,
  currentTime: 0,
  addListener: jest.fn(() => ({ remove: jest.fn() })),
};
jest.mock('expo-video', () => ({
  useVideoPlayer: (_uri: string, setup: (p: unknown) => void) => {
    setup(mockPlayer);
    return mockPlayer;
  },
  VideoView: 'VideoView',
}));
// The native trimmer: absent (app builds before it) unless a test sets it
let mockEditor: { trimVideo: jest.Mock } | null = null;
jest.mock('expo', () => ({
  requireOptionalNativeModule: () => mockEditor,
}));
jest.mock('expo-file-system/legacy', () => ({ getInfoAsync: jest.fn() }));
jest.mock('@/shared/api/stories.service', () => ({
  storiesService: { createUpload: jest.fn(), uploadToSlot: jest.fn(), publish: jest.fn() },
}));
jest.mock('@/shared/api/user.service', () => ({
  userService: { getUserProperties: jest.fn() },
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));
jest.mock('@/shared/utils/permissionDenied', () => ({ showPermissionDenied: jest.fn() }));

let mockIsBusiness = true;
jest.mock('@/shared/hooks/auth/useIdentity', () => ({
  useIdentity: () => ({ isBusiness: mockIsBusiness }),
}));

const asset = (over: Partial<ImagePicker.ImagePickerAsset> = {}) => ({
  canceled: false,
  assets: [{ uri: 'file:///p.jpg', mimeType: 'image/jpeg', fileSize: 2048, width: 1080, height: 1920, ...over }],
});
const slot = {
  storyId: 's1',
  uploadUrlExpiresAt: '2999-01-01T00:00:00.000Z',
  publishBefore: '2999-01-01T00:00:00.000Z',
  media: { method: 'PUT', url: 'https://s3.test/put', headers: {} },
};

const renderComposer = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <StoryComposer />
    </QueryClientProvider>,
  );

describe('StoryComposer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsBusiness = true;
    mockEditor = null;
    useAuthStore.setState({ token: 't', activeIdentity: { id: 'co-1' } as never });
    (userService.getUserProperties as jest.Mock).mockResolvedValue([
      { id: 'p1', location: 'السالمية', categoryLabel: 'شقة', type: 'سكني', images: [], price: 350 },
    ]);
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(asset());
    (storiesService.createUpload as jest.Mock).mockResolvedValue(slot);
    (storiesService.uploadToSlot as jest.Mock).mockResolvedValue(200);
    (storiesService.publish as jest.Mock).mockResolvedValue({ id: 's1' });
  });

  const pick = async (screen: Awaited<ReturnType<typeof renderComposer>>) => {
    await act(async () => {
      await fireEvent.press(screen.getByTestId('composer-pick-library'));
    });
  };

  it('individuals cannot post', async () => {
    mockIsBusiness = false;
    const screen = await renderComposer();
    expect(screen.getByText('نشر القصص متاح للشركات والمكاتب فقط')).toBeTruthy();
    expect(screen.queryByTestId('composer-pick-library')).toBeNull();
  });

  it('picks from the gallery as a compatible JPEG and previews it', async () => {
    const screen = await renderComposer();
    await pick(screen);
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaTypes: ['images', 'videos'],
        preferredAssetRepresentationMode: 'compatible',
        // Videos: at most 30 s, exported as 720p H.264 on iOS
        videoMaxDuration: 30,
        videoExportPreset: 6,
      }),
    );
    expect(screen.getByTestId('composer-preview').props.source).toEqual({ uri: 'file:///p.jpg' });
  });

  it('a HEIC photo is refused', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(
      asset({ mimeType: 'image/heic', uri: 'file:///p.heic' }),
    );
    const screen = await renderComposer();
    await pick(screen);
    expect(showAlert).toHaveBeenCalledWith('تنبيه', 'نوع الصورة غير مدعوم (JPEG أو PNG أو WebP)');
    expect(screen.queryByTestId('composer-preview')).toBeNull();
  });

  it('a photo over 10 MB is refused', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(
      asset({ fileSize: 11 * 1024 * 1024 }),
    );
    const screen = await renderComposer();
    await pick(screen);
    expect(showAlert).toHaveBeenCalledWith('تنبيه', 'حجم الصورة يتجاوز 10 ميجابايت');
  });

  it('reads the size from the file when the picker does not give it', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(asset({ fileSize: undefined }));
    (getInfoAsync as jest.Mock).mockResolvedValue({ exists: true, size: 4096 });
    const screen = await renderComposer();
    await pick(screen);
    await act(async () => {
      await fireEvent.press(screen.getByTestId('composer-publish'));
    });
    expect(storiesService.createUpload).toHaveBeenCalledWith({
      mediaType: 'IMAGE',
      contentType: 'image/jpeg',
      sizeBytes: 4096,
    });
  });

  it('takes a caption of up to 200 characters', async () => {
    const screen = await renderComposer();
    await pick(screen);
    const input = screen.getByTestId('composer-caption');
    expect(input.props.maxLength).toBe(200);
    expect(input.props.placeholder).toBe('اضافة شرح توضيحي....');
  });

  it('the image+ button links a listing, shown as a chip that can be removed', async () => {
    const screen = await renderComposer();
    await pick(screen);
    await waitFor(() => expect(screen.getByText('شقة · السالمية')).toBeTruthy());
    await act(async () => {
      await fireEvent.press(screen.getByText('شقة · السالمية'));
    });
    expect(screen.getByTestId('composer-linked')).toHaveTextContent(/شقة · السالمية/);
    await act(async () => {
      await fireEvent.press(screen.getByTestId('composer-unlink'));
    });
    expect(screen.queryByTestId('composer-linked')).toBeNull();
  });

  it('× on the preview goes back to choosing', async () => {
    const screen = await renderComposer();
    await pick(screen);
    await act(async () => {
      await fireEvent.press(screen.getByTestId('composer-change'));
    });
    expect(screen.queryByTestId('composer-preview')).toBeNull();
    expect(screen.getByTestId('composer-pick-library')).toBeTruthy();
    expect(mockRouter.back).not.toHaveBeenCalled();
  });

  it('publishes with the caption and the chosen listing, then closes', async () => {
    const screen = await renderComposer();
    await pick(screen);
    await fireEvent.changeText(screen.getByTestId('composer-caption'), ' عرض جديد ');
    await waitFor(() => expect(screen.getByText('شقة · السالمية')).toBeTruthy());
    await act(async () => {
      await fireEvent.press(screen.getByText('شقة · السالمية'));
    });
    await act(async () => {
      await fireEvent.press(screen.getByTestId('composer-publish'));
    });

    expect(storiesService.createUpload).toHaveBeenCalledWith({
      mediaType: 'IMAGE',
      contentType: 'image/jpeg',
      sizeBytes: 2048,
    });
    expect(storiesService.publish).toHaveBeenCalledWith('s1', {
      caption: 'عرض جديد',
      propertyId: 'p1',
    });
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('a refused publish says why and stays open', async () => {
    (storiesService.publish as jest.Mock).mockRejectedValue({
      response: { data: { code: 'STORY_LIMIT' } },
    });
    const screen = await renderComposer();
    await pick(screen);
    await act(async () => {
      await fireEvent.press(screen.getByTestId('composer-publish'));
    });
    expect(showAlert).toHaveBeenCalledWith('تعذر نشر القصة', 'وصلت للحد الأقصى من القصص، حاول لاحقاً');
    expect(mockRouter.back).not.toHaveBeenCalled();
    expect(screen.getByTestId('composer-publish')).toBeTruthy();
  });

  it('a company without a subscription gets the plans prompt', async () => {
    (storiesService.createUpload as jest.Mock).mockRejectedValue({
      response: { data: { code: 'SUBSCRIPTION_REQUIRED' } },
    });
    const screen = await renderComposer();
    await pick(screen);
    await act(async () => {
      await fireEvent.press(screen.getByTestId('composer-publish'));
    });
    const titles = (showAlert as jest.Mock).mock.calls.map((c: unknown[]) => c[0]);
    expect(titles).not.toContain('تعذر نشر القصة');
    expect(titles.some((t) => t === 'اشترك للمتابعة' || t === 'انتهت باقة شركتك')).toBe(true);
  });

  it('a camera that is not allowed says so', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
    const screen = await renderComposer();
    await act(async () => {
      await fireEvent.press(screen.getByTestId('composer-take-photo'));
    });
    expect(showPermissionDenied).toHaveBeenCalledWith('camera');
    expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
  });

  describe('video', () => {
    const videoAsset = (over: Partial<ImagePicker.ImagePickerAsset> = {}) =>
      asset({
        uri: 'file:///v.mp4',
        type: 'video',
        mimeType: 'video/mp4',
        fileSize: 8 * 1024 * 1024,
        duration: 12_000,
        ...over,
      });

    beforeEach(() => {
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(videoAsset());
      (VideoThumbnails.getThumbnailAsync as jest.Mock).mockResolvedValue({
        uri: 'file:///poster.jpg',
      });
      (getInfoAsync as jest.Mock).mockResolvedValue({ exists: true, size: 50_000 });
      (storiesService.createUpload as jest.Mock).mockResolvedValue({
        ...slot,
        poster: { method: 'PUT', url: 'https://s3.test/poster', headers: {} },
      });
    });

    it('a picked video plays in the preview; its poster is made for the upload', async () => {
      const screen = await renderComposer();
      await pick(screen);
      expect(VideoThumbnails.getThumbnailAsync).toHaveBeenCalledWith('file:///v.mp4', {
        time: 0,
        quality: 0.7,
      });
      expect(screen.getByTestId('composer-preview')).toBeTruthy();
      expect(mockPlayer.play).toHaveBeenCalled();
      // App builds without the trimmer: no trim bar
      expect(screen.queryByTestId('composer-trim')).toBeNull();
    });

    it('publishes the video with its poster', async () => {
      const screen = await renderComposer();
      await pick(screen);
      await act(async () => {
        await fireEvent.press(screen.getByTestId('composer-publish'));
      });
      expect(storiesService.createUpload).toHaveBeenCalledWith({
        mediaType: 'VIDEO',
        contentType: 'video/mp4',
        sizeBytes: 8 * 1024 * 1024,
        poster: { contentType: 'image/jpeg', sizeBytes: 50_000 },
      });
      expect((storiesService.uploadToSlot as jest.Mock).mock.calls.map((c) => c[1])).toEqual([
        'file:///poster.jpg',
        'file:///v.mp4',
      ]);
      expect(mockRouter.back).toHaveBeenCalled();
    });

    it.each([
      ['over 30 s', { duration: 31_000 }, 'مدة الفيديو تتجاوز 30 ثانية'],
      ['over 50 MB', { fileSize: 51 * 1024 * 1024 }, 'حجم الفيديو يتجاوز 50 ميجابايت'],
      ['a WebM', { mimeType: 'video/webm', uri: 'file:///v.webm' }, 'نوع الفيديو غير مدعوم (MP4 أو MOV)'],
    ])('%s is refused before uploading', async (_label, over, message) => {
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(videoAsset(over));
      const screen = await renderComposer();
      await pick(screen);
      expect(showAlert).toHaveBeenCalledWith('تنبيه', message);
      expect(screen.queryByTestId('composer-preview')).toBeNull();
      expect(VideoThumbnails.getThumbnailAsync).not.toHaveBeenCalled();
    });

    it('a poster over 1 MB is made again at a lower quality', async () => {
      (getInfoAsync as jest.Mock)
        .mockResolvedValueOnce({ exists: true, size: 2 * 1024 * 1024 })
        .mockResolvedValueOnce({ exists: true, size: 300_000 });
      const screen = await renderComposer();
      await pick(screen);
      expect((VideoThumbnails.getThumbnailAsync as jest.Mock).mock.calls.map((c) => c[1].quality)).toEqual([0.7, 0.4]);
      expect(screen.getByTestId('composer-preview')).toBeTruthy();
    });

    it('a video whose still cannot be made is refused', async () => {
      (VideoThumbnails.getThumbnailAsync as jest.Mock).mockRejectedValue(new Error('codec'));
      const screen = await renderComposer();
      await pick(screen);
      expect(showAlert).toHaveBeenCalledWith('تنبيه', 'تعذر تجهيز الفيديو، اختر فيديو آخر');
      expect(screen.queryByTestId('composer-preview')).toBeNull();
    });

    it('the camera can record up to 30 s too', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({ canceled: true, assets: [] });
      const screen = await renderComposer();
      await act(async () => {
        await fireEvent.press(screen.getByTestId('composer-take-photo'));
      });
      expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith(
        expect.objectContaining({ mediaTypes: ['images', 'videos'], videoMaxDuration: 30 }),
      );
    });

    describe('with the trimmer (new app builds)', () => {
      beforeEach(() => {
        mockEditor = {
          trimVideo: jest.fn().mockResolvedValue({
            uri: 'file:///cut.mp4',
            sizeBytes: 6 * 1024 * 1024,
            durationMs: 30_000,
          }),
        };
      });

      it('takes a longer video and starts with its first 30 s', async () => {
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(
          videoAsset({ duration: 120_000, fileSize: 90 * 1024 * 1024 }),
        );
        const screen = await renderComposer();
        await pick(screen);
        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
          expect.not.objectContaining({ videoMaxDuration: expect.anything() }),
        );
        expect(showAlert).not.toHaveBeenCalled();
        expect(screen.getByTestId('composer-trim-range')).toHaveTextContent('0:00 - 0:30');
      });

      it('cuts it before upload and sends the cut file with its own poster', async () => {
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(
          videoAsset({ duration: 120_000, fileSize: 90 * 1024 * 1024 }),
        );
        const screen = await renderComposer();
        await pick(screen);
        await act(async () => {
          await fireEvent.press(screen.getByTestId('composer-sound'));
        });
        await act(async () => {
          await fireEvent.press(screen.getByTestId('composer-publish'));
        });
        expect(mockEditor?.trimVideo).toHaveBeenCalledWith('file:///v.mp4', {
          startMs: 0,
          endMs: 30_000,
          muted: true,
        });
        expect(VideoThumbnails.getThumbnailAsync).toHaveBeenLastCalledWith(
          'file:///cut.mp4',
          { time: 0, quality: 0.7 },
        );
        expect(storiesService.createUpload).toHaveBeenCalledWith(
          expect.objectContaining({ contentType: 'video/mp4', sizeBytes: 6 * 1024 * 1024 }),
        );
        expect((storiesService.uploadToSlot as jest.Mock).mock.calls.map((c) => c[1])).toContain(
          'file:///cut.mp4',
        );
        expect(mockRouter.back).toHaveBeenCalled();
      });

      it('a short video with its sound is sent as it is', async () => {
        const screen = await renderComposer();
        await pick(screen);
        await act(async () => {
          await fireEvent.press(screen.getByTestId('composer-publish'));
        });
        expect(mockEditor?.trimVideo).not.toHaveBeenCalled();
        expect((storiesService.uploadToSlot as jest.Mock).mock.calls.map((c) => c[1])).toContain(
          'file:///v.mp4',
        );
      });

      it('a cut that fails says so and uploads nothing', async () => {
        mockEditor?.trimVideo.mockRejectedValue(new Error('export failed'));
        const screen = await renderComposer();
        await pick(screen);
        await act(async () => {
          await fireEvent.press(screen.getByTestId('composer-sound'));
        });
        await act(async () => {
          await fireEvent.press(screen.getByTestId('composer-publish'));
        });
        expect(showAlert).toHaveBeenCalledWith('تنبيه', 'تعذر تجهيز الفيديو، اختر فيديو آخر');
        expect(storiesService.createUpload).not.toHaveBeenCalled();
        expect(mockRouter.back).not.toHaveBeenCalled();
      });

      it('a video over 10 minutes is refused', async () => {
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(
          videoAsset({ duration: 11 * 60_000 }),
        );
        const screen = await renderComposer();
        await pick(screen);
        expect(showAlert).toHaveBeenCalledWith('تنبيه', 'الفيديو طويل جداً، اختر فيديو أقصر من 10 دقائق');
        expect(screen.queryByTestId('composer-preview')).toBeNull();
      });
    });
  });
});
