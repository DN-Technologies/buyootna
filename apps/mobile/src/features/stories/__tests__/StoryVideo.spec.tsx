import { act, render } from '@testing-library/react-native';
import { useVideoPlayer } from 'expo-video';

import StoryVideo from '../components/StoryVideo';

type StatusListener = (e: { status: string }) => void;
const mockPlayer = {
  play: jest.fn(),
  pause: jest.fn(),
  status: 'loading',
  currentTime: 5,
  loop: true,
  listeners: [] as StatusListener[],
  addListener: jest.fn((_event: string, fn: StatusListener) => {
    mockPlayer.listeners.push(fn);
    return { remove: () => mockPlayer.listeners.splice(mockPlayer.listeners.indexOf(fn), 1) };
  }),
};
jest.mock('expo-video', () => ({
  useVideoPlayer: jest.fn((_url: string, setup: (p: unknown) => void) => {
    setup(mockPlayer);
    return mockPlayer;
  }),
  VideoView: 'VideoView',
}));
jest.mock('expo-image', () => ({ Image: 'Image' }));

const emit = (status: string) =>
  act(() => {
    mockPlayer.listeners.forEach((fn) => fn({ status }));
  });

describe('StoryVideo', () => {
  const props = {
    url: 'https://s3.test/v.mp4',
    posterUrl: 'https://s3.test/poster.jpg',
    playing: false,
    restartKey: 0,
    onReady: jest.fn(),
    onWaiting: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPlayer.listeners = [];
    mockPlayer.status = 'loading';
    mockPlayer.currentTime = 5;
  });

  it('streams the link without caching, once, with no controls or picture-in-picture', async () => {
    const screen = await render(<StoryVideo {...props} />);
    expect(useVideoPlayer).toHaveBeenCalledWith('https://s3.test/v.mp4', expect.any(Function));
    // A plain link: expo-video caches only a source with useCaching
    expect(typeof (useVideoPlayer as jest.Mock).mock.calls[0][0]).toBe('string');
    expect(mockPlayer.loop).toBe(false);
    const view = screen.getByTestId('story-video');
    expect(view.props.nativeControls).toBe(false);
    expect(view.props.allowsPictureInPicture).toBe(false);
  });

  it('shows the poster (in memory only) until the video is ready', async () => {
    const screen = await render(<StoryVideo {...props} />);
    expect(screen.getByTestId('story-video-poster').props.cachePolicy).toBe('memory');
    await emit('readyToPlay');
    expect(props.onReady).toHaveBeenCalled();
    expect(screen.queryByTestId('story-video-poster')).toBeNull();
  });

  it('a player already ready counts at once', async () => {
    mockPlayer.status = 'readyToPlay';
    await render(<StoryVideo {...props} />);
    expect(props.onReady).toHaveBeenCalled();
  });

  it('plays and pauses with the story clock', async () => {
    const screen = await render(<StoryVideo {...props} />);
    expect(mockPlayer.pause).toHaveBeenCalled();
    await screen.rerender(<StoryVideo {...props} playing />);
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
    await screen.rerender(<StoryVideo {...props} playing={false} />);
    expect(mockPlayer.pause).toHaveBeenCalledTimes(2);
  });

  it('waiting for the network and errors are reported', async () => {
    await render(<StoryVideo {...props} />);
    await emit('loading');
    expect(props.onWaiting).toHaveBeenCalled();
    await emit('error');
    expect(props.onError).toHaveBeenCalled();
  });

  it('starting the same story over goes back to the beginning', async () => {
    const screen = await render(<StoryVideo {...props} />);
    expect(mockPlayer.currentTime).toBe(5);
    await screen.rerender(<StoryVideo {...props} restartKey={1} />);
    expect(mockPlayer.currentTime).toBe(0);
  });

  it('stops listening when it goes away (the player is released with it)', async () => {
    const screen = await render(<StoryVideo {...props} />);
    // Its status, and its video track (for the fill)
    expect(mockPlayer.listeners).toHaveLength(2);
    await screen.unmount();
    expect(mockPlayer.listeners).toHaveLength(0);
  });
});
