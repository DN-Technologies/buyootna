import { act, renderHook } from '@testing-library/react-native';

import { ChatMessage, chatService, LocalAttachment } from '@/shared/api/chat.service';
import { useChatStore } from '@/shared/store/useChatStore';
import { showAlert } from '@/shared/utils/alert';

import { useChatComposer } from '../useChatComposer';

jest.mock('@/shared/api/chat.service', () => ({
  chatService: { respondToProposal: jest.fn() },
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));
jest.mock('expo-image-picker', () => ({}));
jest.mock('expo-document-picker', () => ({}));
jest.mock('expo-file-system/legacy', () => ({ getInfoAsync: jest.fn() }));
jest.mock('@/shared/store/useChatStore', () => ({
  useChatStore: { getState: jest.fn() },
}));

const store = {
  sendMessage: jest.fn(),
  sendAttachments: jest.fn(async () => {}),
  retryAttachments: jest.fn(),
  updateMessage: jest.fn(),
};
const scrollToEnd = jest.fn();
const setReplyTarget = jest.fn();
const reply = { id: 'm-reply' } as ChatMessage;
const photo: LocalAttachment = {
  uri: 'file:///a.jpg',
  name: 'a.jpg',
  mimeType: 'image/jpeg',
  size: 1000,
  kind: 'IMAGE',
};

const setup = async (over: { conversationId?: string; replyTarget?: ChatMessage | null } = {}) =>
  renderHook(() =>
    useChatComposer({
      conversationId: over.conversationId ?? 'c1',
      replyTarget: over.replyTarget ?? null,
      setReplyTarget,
      listRef: { current: { scrollToEnd } as never },
    }),
  );

describe('useChatComposer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useChatStore.getState as jest.Mock).mockReturnValue(store);
    store.sendMessage.mockReturnValue(true);
  });
  afterEach(() => jest.useRealTimers());

  it('sends a sheet\'s message as a reply, closes the sheet and clears the reply', async () => {
    const { result } = await setup({ replyTarget: reply });
    await act(async () => result.current.setComposer('location'));

    await act(async () =>
      result.current.sendRich({ type: 'LOCATION', latitude: 29.3, longitude: 48 }),
    );

    expect(store.sendMessage).toHaveBeenCalledWith('c1', {
      type: 'LOCATION',
      latitude: 29.3,
      longitude: 48,
      replyTo: reply,
    });
    expect(result.current.composer).toBeNull();
    expect(setReplyTarget).toHaveBeenCalledWith(null);
  });

  it('says so when the message could not be sent, keeping the reply', async () => {
    store.sendMessage.mockReturnValue(false);
    const { result } = await setup({ replyTarget: reply });

    await act(async () => result.current.sendRich({ type: 'PROPERTY', propertyId: 'p1' }));

    expect(showAlert).toHaveBeenCalledWith(
      'خطأ',
      'تعذر الإرسال، تحقق من الاتصال وحاول مرة أخرى',
    );
    expect(setReplyTarget).not.toHaveBeenCalled();
  });

  it('sends nothing before the conversation exists', async () => {
    const { result } = await setup({ conversationId: '' });
    await act(async () => {
      result.current.sendRich({ type: 'PROPERTY', propertyId: 'p1' });
      result.current.sendVoice(photo);
    });
    expect(store.sendMessage).not.toHaveBeenCalled();
    expect(store.sendAttachments).not.toHaveBeenCalled();
  });

  it('opens the preview for picked files and sends them from it', async () => {
    const { result } = await setup({ replyTarget: reply });

    await act(async () => result.current.handlePickedFiles([photo]));
    expect(result.current.pickedFiles).toEqual([photo]);

    await act(async () => result.current.sendPickedFiles([photo], 'المطبخ'));
    expect(result.current.pickedFiles).toBeNull();
    expect(store.sendAttachments).toHaveBeenCalledWith('c1', {
      files: [photo],
      caption: 'المطبخ',
      replyTo: reply,
    });
    expect(setReplyTarget).toHaveBeenCalledWith(null);
  });

  // QA: a video over the limit was refused with no message
  it('refuses a single file over a limit with the reason, without the preview', async () => {
    const { result } = await setup();
    const video = {
      ...photo,
      kind: 'VIDEO' as const,
      mimeType: 'video/mp4',
      size: 120 * 1024 * 1024,
    };

    await act(async () => result.current.handlePickedFiles([video]));
    expect(result.current.pickedFiles).toBeNull();
    expect(showAlert).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(showAlert).toHaveBeenCalledWith(
      'تعذر إرسال المرفق',
      'حجم الفيديو يتجاوز الحد المسموح به (الحد الأقصى 100 ميجابايت)',
    );
  });

  it('sends a voice note as an attachment', async () => {
    const { result } = await setup();
    await act(async () => result.current.sendVoice(photo));
    expect(store.sendAttachments).toHaveBeenCalledWith('c1', {
      files: [photo],
      caption: undefined,
      replyTo: undefined,
    });
  });

  it('opens the matching form to counter an offer or an appointment', async () => {
    const { result } = await setup();
    const offer = { id: 'm1', type: 'OFFER' } as ChatMessage;

    await act(async () => result.current.startCounter(offer));
    expect(result.current.composer).toBe('offer');
    expect(result.current.counterOf).toBe(offer);

    await act(async () =>
      result.current.startCounter({ id: 'm2', type: 'APPOINTMENT' } as ChatMessage),
    );
    expect(result.current.composer).toBe('appointment');

    await act(async () => result.current.closeComposer());
    expect(result.current.composer).toBeNull();
    expect(result.current.counterOf).toBeNull();
  });

  it('answers an offer and patches its card, or reports the failure', async () => {
    const message = { id: 'm1', proposal: { id: 'pr1' } } as ChatMessage;
    (chatService.respondToProposal as jest.Mock).mockResolvedValueOnce({
      proposal: { id: 'pr1', status: 'ACCEPTED' },
    });
    const { result } = await setup();

    await act(async () => result.current.respondToProposal(message, 'accept' as never));
    expect(store.updateMessage).toHaveBeenCalledWith('c1', 'm1', {
      proposal: { id: 'pr1', status: 'ACCEPTED' },
    });

    (chatService.respondToProposal as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: 'انتهت صلاحية العرض' } },
    });
    await act(async () => result.current.respondToProposal(message, 'accept' as never));
    expect(showAlert).toHaveBeenCalledWith('خطأ', 'انتهت صلاحية العرض');
  });
});
