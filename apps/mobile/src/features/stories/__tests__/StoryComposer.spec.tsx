import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { getInfoAsync } from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

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
      expect.objectContaining({ preferredAssetRepresentationMode: 'compatible' }),
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
    expect(storiesService.createUpload).toHaveBeenCalledWith('image/jpeg', 4096);
  });

  it('counts the caption up to 200', async () => {
    const screen = await renderComposer();
    await pick(screen);
    const input = screen.getByTestId('composer-caption');
    expect(input.props.maxLength).toBe(200);
    await fireEvent.changeText(input, 'عرض جديد');
    expect(screen.getByTestId('composer-caption-count')).toHaveTextContent('8/200');
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

    expect(storiesService.createUpload).toHaveBeenCalledWith('image/jpeg', 2048);
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
});
