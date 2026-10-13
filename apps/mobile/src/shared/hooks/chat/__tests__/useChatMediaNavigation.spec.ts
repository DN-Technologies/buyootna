import { act, renderHook } from '@testing-library/react-native';

import { chatService } from '@/shared/api/chat.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import { useChatMedia } from '../useChatMedia';
import { useChatNavigation } from '../useChatNavigation';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@/shared/api/chat.service', () => ({
  chatService: { attachmentUrl: jest.fn() },
}));
const mockOpenViewer = jest.fn();
jest.mock('@/shared/components/media/ImageViewer', () => ({
  useImageViewer: () => ({ open: mockOpenViewer, viewer: null }),
}));
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: { getState: jest.fn() },
}));

describe('useChatMedia', () => {
  beforeEach(() => jest.clearAllMocks());

  it('opens a chat image among the conversation\'s images, at the tapped one', async () => {
    const messages = [
      { id: 'd', kind: 'date' },
      { id: '1', type: 'IMAGE', imageUrl: 'https://cdn/a.jpg' },
      { id: '2', type: 'TEXT', content: 'هلا' },
      { id: '3', type: 'IMAGE', imageUrl: 'https://cdn/b.jpg' },
    ];
    const { result } = await renderHook(() => useChatMedia(messages));

    result.current.openImage('https://cdn/b.jpg');

    expect(mockOpenViewer).toHaveBeenCalledWith(['https://cdn/a.jpg', 'https://cdn/b.jpg'], 1);
  });

  it('plays a video from a fresh link, or the message\'s own when that fails', async () => {
    (chatService.attachmentUrl as jest.Mock).mockResolvedValueOnce('https://cdn/fresh.mp4');
    const { result } = await renderHook(() => useChatMedia([]));

    await act(async () => result.current.openVideo({ id: 'v1', url: 'https://cdn/old.mp4' }));
    expect(result.current.videoUrl).toBe('https://cdn/fresh.mp4');

    (chatService.attachmentUrl as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    await act(async () => result.current.openVideo({ id: 'v1', url: 'https://cdn/old.mp4' }));
    expect(result.current.videoUrl).toBe('https://cdn/old.mp4');

    await act(async () => result.current.closeVideo());
    expect(result.current.videoUrl).toBeNull();
  });
});

describe('useChatNavigation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('opens a request in the company\'s own screen, or the requester\'s', async () => {
    (useAuthStore.getState as jest.Mock).mockReturnValue({ activeIdentity: { type: 'COMPANY' } });
    const { result } = await renderHook(() => useChatNavigation());
    result.current.openRequest('r1');
    expect(mockPush).toHaveBeenLastCalledWith('/(company)/(requests)/r1');

    (useAuthStore.getState as jest.Mock).mockReturnValue({ activeIdentity: { type: 'INDIVIDUAL' } });
    result.current.openRequest('r1');
    expect(mockPush).toHaveBeenLastCalledWith({
      pathname: '/request-details/[id]',
      params: { id: 'r1' },
    });
  });

  it('opens an ad card, falling back to the pinned ad, or nothing', async () => {
    const pinned = await renderHook(() => useChatNavigation('p-pinned'));
    pinned.result.current.openMessageProperty('p1');
    expect(mockPush).toHaveBeenLastCalledWith('/property/p1');
    pinned.result.current.openMessageProperty();
    expect(mockPush).toHaveBeenLastCalledWith('/property/p-pinned');

    mockPush.mockClear();
    const none = await renderHook(() => useChatNavigation());
    none.result.current.openMessageProperty();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
