import { act, renderHook } from '@testing-library/react-native';

import { handleSubscriptionRequired } from '@/features/company/utils/subscriptionRequired';
import { reelsService } from '@/shared/api/reels.service';
import { showAlert } from '@/shared/utils/alert';

import { useReelComposer } from '../hooks/useReelComposer';
import { publishReel } from '../publishReel';

const mockBack = jest.fn();
const mockTrim = jest.fn();
let mockEditor: { trimVideo: jest.Mock } | null = { trimVideo: mockTrim };
let mockBusiness = true;

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, canGoBack: () => true, replace: jest.fn() }),
}));
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  UIImagePickerPreferredAssetRepresentationMode: { Compatible: 'c' },
  VideoExportPreset: { H264_1280x720: 'p' },
}));
jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: [{ id: 'p1', categoryLabel: 'شقة', location: 'السالمية' }],
  }),
}));
jest.mock('@/features/stories/components/composer/useStoryComposer', () => ({
  NO_LISTING: 'none',
  sizeOf: jest.fn(async (_uri: string, size?: number) => size ?? 5000),
  makePoster: jest.fn(async () => ({ uri: 'file:///poster.jpg', sizeBytes: 100 })),
}));
jest.mock('@/features/stories/videoEditor', () => ({
  ...jest.requireActual<Record<string, unknown>>('@/features/stories/videoEditor'),
  getVideoEditor: () => mockEditor,
}));
jest.mock('@/shared/api/reels.service', () => ({ reelsService: {} }));
jest.mock('@/shared/api/user.service', () => ({ userService: {} }));
jest.mock('@/shared/hooks/auth/useIdentity', () => ({
  useIdentity: () => ({ isBusiness: mockBusiness }),
}));
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (select: (s: unknown) => unknown) =>
    select({ activeIdentity: { id: 'me' } }),
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));
jest.mock('@/features/company/utils/subscriptionRequired', () => ({
  handleSubscriptionRequired: jest.fn(() => false),
}));
jest.mock('../publishReel', () => ({
  publishReel: jest.fn(),
  reelPublishErrorMessage: () => 'رسالة الخطأ',
}));

const capture = { kind: 'video' as const, uri: 'file:///rec.mov', durationMs: 20_000 };

describe('useReelComposer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEditor = { trimVideo: mockTrim };
    mockBusiness = true;
    mockTrim.mockResolvedValue({
      uri: 'file:///out.mp4',
      sizeBytes: 3000,
      durationMs: 20_000,
    });
    (publishReel as jest.Mock).mockResolvedValue({ id: 'r1' });
  });

  it('can only be used by a business, on a build with the trimmer', async () => {
    mockBusiness = false;
    const { result, rerender } = await renderHook(() => useReelComposer());
    expect(result.current.canPost).toBe(false);
    mockBusiness = true;
    mockEditor = null;
    await rerender(undefined);
    expect(result.current.canPost).toBe(false);
  });

  it('a long video starts with its first 60 seconds', async () => {
    const { result } = await renderHook(() => useReelComposer());
    await act(() =>
      result.current.acceptCaptured({ ...capture, durationMs: 300_000 }),
    );
    expect(result.current.trim).toEqual({ startMs: 0, endMs: 60_000 });
  });

  it('refuses a source over 10 minutes', async () => {
    const { result } = await renderHook(() => useReelComposer());
    await act(() =>
      result.current.acceptCaptured({ ...capture, durationMs: 11 * 60_000 }),
    );
    expect(result.current.media).toBeNull();
    expect(showAlert).toHaveBeenCalled();
  });

  it('always exports through the trimmer, even a video needing no cut', async () => {
    const { result } = await renderHook(() => useReelComposer());
    await act(() => result.current.acceptCaptured(capture));
    await act(() => result.current.publish());

    expect(mockTrim).toHaveBeenCalledWith('file:///rec.mov', {
      startMs: 0,
      endMs: 20_000,
      muted: false,
    });
    expect(publishReel).toHaveBeenCalledWith(
      reelsService,
      {
        uri: 'file:///out.mp4',
        sizeBytes: 3000,
        poster: { uri: 'file:///poster.jpg', sizeBytes: 100 },
      },
      { caption: '', propertyId: undefined },
      expect.any(Function),
    );
    expect(mockBack).toHaveBeenCalled();
  });

  it('sends the chosen listing', async () => {
    const { result } = await renderHook(() => useReelComposer());
    await act(() => result.current.acceptCaptured(capture));
    await act(async () => result.current.setPropertyId('p1'));
    expect(result.current.linkedLabel).toBe('شقة · السالمية');
    await act(() => result.current.publish());
    expect((publishReel as jest.Mock).mock.calls[0][2]).toEqual({
      caption: '',
      propertyId: 'p1',
    });
  });

  it('stops before uploading when the export is too big', async () => {
    mockTrim.mockResolvedValue({
      uri: 'file:///out.mp4',
      sizeBytes: 60 * 1024 * 1024,
      durationMs: 60_000,
    });
    const { result } = await renderHook(() => useReelComposer());
    await act(() => result.current.acceptCaptured(capture));
    await act(() => result.current.publish());
    expect(publishReel).not.toHaveBeenCalled();
    expect(showAlert).toHaveBeenCalled();
  });

  it('stays on the screen and says why when publishing fails', async () => {
    (publishReel as jest.Mock).mockRejectedValue(new Error('x'));
    const { result } = await renderHook(() => useReelComposer());
    await act(() => result.current.acceptCaptured(capture));
    await act(() => result.current.publish());
    expect(showAlert).toHaveBeenCalledWith('تعذر نشر الفيديو', 'رسالة الخطأ');
    expect(mockBack).not.toHaveBeenCalled();
    expect(result.current.progress).toBeNull();
  });

  it('a lapsed subscription offers the plans instead', async () => {
    (publishReel as jest.Mock).mockRejectedValue(new Error('x'));
    (handleSubscriptionRequired as jest.Mock).mockReturnValueOnce(true);
    const { result } = await renderHook(() => useReelComposer());
    await act(() => result.current.acceptCaptured(capture));
    await act(() => result.current.publish());
    expect(showAlert).not.toHaveBeenCalled();
  });
});
