import { act, render, screen } from '@testing-library/react-native';
import { useVideoPlayer } from 'expo-video';
import { Platform } from 'react-native';

import VideoPlayerModal from '@/shared/components/chat/VideoPlayerModal';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const player = {
  play: jest.fn(),
  pause: jest.fn(),
  status: 'readyToPlay',
  playing: true,
  currentTime: 0,
  bufferedPosition: 0,
};

const setup = async () => {
  await render(<VideoPlayerModal url="https://files.test/tour.mp4" onClose={jest.fn()} />);
};
const seconds = async (n: number) => {
  await act(async () => {
    jest.advanceTimersByTime(n * 1000);
  });
};

describe('VideoPlayerModal', () => {
  const realOS = Platform.OS;
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    Object.assign(player, { status: 'readyToPlay', playing: true, currentTime: 0, bufferedPosition: 0 });
    (useVideoPlayer as jest.Mock).mockReturnValue(player);
    Platform.OS = 'ios';
  });
  afterEach(() => {
    Platform.OS = realOS;
    jest.useRealTimers();
  });

  it('leaves a video that is playing alone', async () => {
    await setup();
    await seconds(15);
    expect(screen.queryByTestId('video-player-buffering')).toBeNull();
    expect(player.pause).not.toHaveBeenCalled();
    expect(player.play).not.toHaveBeenCalled();
  });

  // QA (iOS): the picture froze while the controls still said "playing"
  it('shows a spinner while waiting, and restarts once video is buffered ahead', async () => {
    await setup();
    Object.assign(player, { status: 'loading', playing: false, currentTime: 12, bufferedPosition: 20 });

    await seconds(1);
    expect(screen.getByTestId('video-player-buffering')).toBeTruthy();
    expect(player.play).not.toHaveBeenCalled();

    await seconds(2);
    expect(player.pause).toHaveBeenCalledTimes(1);
    expect(player.play).toHaveBeenCalledTimes(1);

    Object.assign(player, { status: 'readyToPlay', playing: true });
    await seconds(1);
    expect(screen.queryByTestId('video-player-buffering')).toBeNull();
    await seconds(10);
    expect(player.play).toHaveBeenCalledTimes(1);
  });

  it('waits longer before restarting when nothing is buffered yet', async () => {
    await setup();
    Object.assign(player, { status: 'loading', playing: false, currentTime: 12, bufferedPosition: 12 });

    await seconds(9);
    expect(player.play).not.toHaveBeenCalled();
    await seconds(1);
    expect(player.play).toHaveBeenCalledTimes(1);
  });

  it('does not restart a video the user paused', async () => {
    await setup();
    Object.assign(player, { status: 'readyToPlay', playing: false, currentTime: 12, bufferedPosition: 40 });
    await seconds(15);
    expect(screen.queryByTestId('video-player-buffering')).toBeNull();
    expect(player.play).not.toHaveBeenCalled();
  });

  it('only shows the spinner on Android, where the player resumes by itself', async () => {
    Platform.OS = 'android';
    await setup();
    Object.assign(player, { status: 'loading', playing: false, currentTime: 12, bufferedPosition: 20 });
    await seconds(12);
    expect(screen.getByTestId('video-player-buffering')).toBeTruthy();
    expect(player.play).not.toHaveBeenCalled();
  });

  it('stops checking once closed', async () => {
    await setup();
    await screen.unmount();
    Object.assign(player, { status: 'loading', playing: false, currentTime: 12, bufferedPosition: 20 });
    await seconds(15);
    expect(player.play).not.toHaveBeenCalled();
  });
});
