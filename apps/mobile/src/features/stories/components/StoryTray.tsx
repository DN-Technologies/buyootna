import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';

import { useStoriesFeed } from '../hooks/useStoriesQueries';
import StoryRing from './StoryRing';

/**
 * The stories tray at the top of the home screens: providers with live
 * stories in the feed's order (unseen first, followed first). Hidden while
 * there are none, so nothing changes until stories exist.
 */
export default function StoryTray({
  className = '',
}: {
  // Spacing that only applies while the tray is shown
  className?: string;
}) {
  const router = useRouter();
  const { authors, refetch, loadMore } = useStoriesFeed();

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  if (authors.length === 0) return null;

  return (
    <View testID="story-tray" className={`pb-3 pt-1 ${className}`}>
      <FlatList
        horizontal
        data={authors}
        keyExtractor={(a) => a.author.identityId}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        onEndReached={() => void loadMore()}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <View className="w-[68px] items-center gap-1">
            <StoryRing
              testID={`story-ring-${item.author.identityId}`}
              author={item.author}
              hasUnseen={item.hasUnseen}
              onPress={() =>
                router.push({
                  pathname: '/stories/[authorId]',
                  params: { authorId: item.author.identityId, source: 'feed' },
                } as never)
              }
            />
            <Text
              numberOfLines={1}
              className="w-full text-center font-cairo-medium text-[11px] text-[#111111]"
            >
              {item.author.name}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
