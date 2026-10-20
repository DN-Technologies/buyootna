import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

interface StoryVideoProps {
  url: string;
  posterUrl: string | null;
  // Follows the story's clock: plays while it runs, pauses otherwise
  playing: boolean;
  // Bumped when the same story starts over
  restartKey: number;
  onReady: () => void;
  // Waiting for the network: the clock stops until it is ready again
  onWaiting: () => void;
  onError: () => void;
}

/**
 * One video story. The player streams the signed link without caching it
 * (expo-video only caches when asked to), shows the poster until the first
 * frame, and is released on unmount, so nothing keeps playing or sounding
 * after the story or the viewer is left.
 */
export default function StoryVideo({
  url,
  posterUrl,
  playing,
  restartKey,
  onReady,
  onWaiting,
  onError,
}: StoryVideoProps) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = false;
  });
  const [ready, setReady] = useState(false);
  const callbacks = useRef({ onReady, onWaiting, onError });
  callbacks.current = { onReady, onWaiting, onError };

  useEffect(() => {
    const sub = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') {
        setReady(true);
        callbacks.current.onReady();
      } else if (status === 'loading') {
        callbacks.current.onWaiting();
      } else if (status === 'error') {
        callbacks.current.onError();
      }
    });
    if (player.status === 'readyToPlay') {
      setReady(true);
      callbacks.current.onReady();
    }
    return () => sub.remove();
  }, [player]);

  useEffect(() => {
    try {
      if (playing) player.play();
      else player.pause();
    } catch {
      // Released while the story closes
    }
  }, [player, playing]);

  const firstRestart = useRef(restartKey);
  useEffect(() => {
    if (restartKey === firstRestart.current) return;
    try {
      player.currentTime = 0;
    } catch {
      // Released while the story closes
    }
  }, [player, restartKey]);

  return (
    <>
      <VideoView
        testID="story-video"
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
      {posterUrl && !ready && (
        <Image
          testID="story-video-poster"
          source={{ uri: posterUrl }}
          // Memory only, like every story file
          cachePolicy="memory"
          contentFit="contain"
          style={StyleSheet.absoluteFill}
        />
      )}
    </>
  );
}
