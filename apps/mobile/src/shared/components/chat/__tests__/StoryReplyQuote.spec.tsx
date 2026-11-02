import { act, fireEvent, render } from '@testing-library/react-native';

import { StoryReplyPreview } from '@/shared/api/chat.service';

import ReplyComposeBar from '../ReplyComposeBar';
import StoryReplyQuote from '../StoryReplyQuote';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

const story = (over: Partial<StoryReplyPreview> = {}): StoryReplyPreview => ({
  mediaType: 'IMAGE',
  thumbnailUrl: 'https://x/thumb.jpg',
  isLive: true,
  authorIdentityId: 'author',
  unavailable: false,
  ...over,
});

const quote = (over: Partial<StoryReplyPreview> = {}, isMine = true) =>
  render(
    <StoryReplyQuote story={story(over)} isMine={isMine} otherName="الشركة" />,
  );

describe('StoryReplyQuote', () => {
  beforeEach(() => jest.clearAllMocks());

  it("names the company's story for the one who replied", async () => {
    const { getByText } = await quote();
    expect(getByText('قصة الشركة')).toBeTruthy();
    expect(getByText('📷 صورة')).toBeTruthy();
  });

  it('says «قصتك» to the company', async () => {
    const { getByText } = await quote({}, false);
    expect(getByText('قصتك')).toBeTruthy();
  });

  it('marks a video', async () => {
    const { getByText } = await quote({ mediaType: 'VIDEO' });
    expect(getByText('🎥 فيديو')).toBeTruthy();
  });

  it('a live story opens its author from the quote', async () => {
    const { getByTestId } = await quote();
    fireEvent.press(getByTestId('story-reply-quote'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/stories/[authorId]',
      params: { authorId: 'author', source: 'author' },
    });
  });

  it('past its 24 hours: keeps the thumbnail, no longer opens', async () => {
    const { getByTestId } = await quote({ isLive: false });
    expect(getByTestId('story-reply-quote-thumbnail')).toBeTruthy();
    expect(getByTestId('story-reply-quote').props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it('a story that is gone says so, with no image and no tap', async () => {
    const { getByText, getByTestId, queryByTestId } = await quote({
      unavailable: true,
      isLive: false,
      thumbnailUrl: null,
    });
    expect(getByText('قصة لم تعد متاحة')).toBeTruthy();
    expect(queryByTestId('story-reply-quote-thumbnail')).toBeNull();
    fireEvent.press(getByTestId('story-reply-quote'));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('an expired link leaves the text line alone', async () => {
    const { getByTestId, getByText, queryByTestId } = await quote();
    await act(async () => {
      fireEvent(getByTestId('story-reply-quote-thumbnail'), 'error', {
        nativeEvent: { error: 'expired' },
      });
    });
    expect(queryByTestId('story-reply-quote-thumbnail')).toBeNull();
    expect(getByText('📷 صورة')).toBeTruthy();
  });
});

describe('ReplyComposeBar with a story', () => {
  it('shows the story and its thumbnail, and ✕ cancels', async () => {
    const onCancel = jest.fn();
    const { getByText, getByTestId } = await render(
      <ReplyComposeBar
        story={story()}
        otherName="الشركة"
        onCancel={onCancel}
      />,
    );
    expect(getByText('الرد على قصة الشركة')).toBeTruthy();
    expect(getByTestId('reply-compose-story-thumbnail')).toBeTruthy();
    fireEvent.press(getByTestId('reply-compose-cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});
