import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { storyFit } from '../storyFrame';
import type { ViewerStory } from '../types';
import StoryVideo from './StoryVideo';

interface StoryMediaProps {
  story: ViewerStory;
  // The story clock is running: a video plays
  playing: boolean;
  restartKey: number;
  loaded: boolean;
  failed: boolean;
  onReady: () => void;
  onWaiting: () => void;
  onError: () => void;
}

/** The story's photo or video, with its loading and failed states. */
export default function StoryMedia({
  story,
  playing,
  restartKey,
  loaded,
  failed,
  onReady,
  onWaiting,
  onError,
}: StoryMediaProps) {
  // A 9:16 photo fills the screen; until its size is known, it fits inside
  const [fit, setFit] = useState<'cover' | 'contain'>('contain');

  return (
    <>
      {story.mediaType === 'VIDEO' ? (
        <StoryVideo
          key={story.id}
          url={story.mediaUrl}
          posterUrl={story.posterUrl}
          playing={playing}
          restartKey={restartKey}
          onReady={onReady}
          onWaiting={onWaiting}
          onError={onError}
        />
      ) : (
        <Image
          testID="story-image"
          source={{ uri: story.mediaUrl }}
          // Memory only: story media must not stay on the phone's disk
          cachePolicy="memory"
          contentFit={fit}
          recyclingKey={story.id}
          style={StyleSheet.absoluteFill}
          onLoad={(e) => {
            setFit(storyFit(e.source.width, e.source.height));
            onReady();
          }}
          onError={onError}
        />
      )}
      {!loaded && !failed && (
        <View style={StyleSheet.absoluteFill} className="items-center justify-center" pointerEvents="none">
          <ActivityIndicator color="#FFFFFF" />
        </View>
      )}
      {failed && (
        <View style={StyleSheet.absoluteFill} className="items-center justify-center" pointerEvents="none">
          <Text className="font-cairo-medium text-[14px] text-white">
            تعذر تحميل القصة
          </Text>
        </View>
      )}
    </>
  );
}
