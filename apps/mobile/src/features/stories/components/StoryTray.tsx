import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import { useIdentity } from '@/shared/hooks/auth/useIdentity';

import { useMyStories, useStoriesFeed } from '../hooks/useStoriesQueries';
import StoryRing from './StoryRing';

/**
 * The stories tray at the top of the home screens: providers with live
 * stories in the feed's order (unseen first, followed first). Companies and
 * offices also get «قصتك» first, to open their own stories or post one.
 * Hidden when there is nothing to show and nothing to post.
 */
export default function StoryTray({
  className = '',
}: {
  // Spacing that only applies while the tray is shown
  className?: string;
}) {
  const router = useRouter();
  const { authors, refetch, loadMore } = useStoriesFeed();
  const { isBusiness, activeIdentity, displayName, avatarUrl, isVerified } =
    useIdentity();
  const mine = useMyStories(isBusiness);
  const refetchMine = mine.refetch;

  useFocusEffect(
    useCallback(() => {
      void refetch();
      if (isBusiness) void refetchMine();
    }, [refetch, refetchMine, isBusiness]),
  );

  const ownType = activeIdentity?.type;
  const canPost = isBusiness && (ownType === 'COMPANY' || ownType === 'OFFICE');
  if (!canPost && authors.length === 0) return null;

  const hasMine = (mine.data?.stories.length ?? 0) > 0;
  const openComposer = () => router.push('/stories/new' as never);
  const openMine = () =>
    router.push({
      pathname: '/stories/[authorId]',
      params: { authorId: activeIdentity?.id ?? '', source: 'mine' },
    } as never);

  const own =
    canPost && activeIdentity ? (
      <View className="w-[68px] items-center gap-1" style={{ marginEnd: 12 }}>
        <View>
          <StoryRing
            testID="story-ring-mine"
            author={{
              identityId: activeIdentity.id,
              type: ownType,
              name: displayName,
              logoUrl: avatarUrl ?? null,
              isVerified: !!isVerified,
            }}
            hasUnseen={hasMine}
            onPress={hasMine ? openMine : openComposer}
          />
          <TouchableOpacity
            testID="story-add"
            onPress={openComposer}
            accessibilityLabel="أضف قصة"
            className="absolute bottom-0 end-0 size-6 items-center justify-center rounded-full border-2 border-white bg-[#15304D]"
          >
            <Feather name="plus" size={12} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text numberOfLines={1} className="font-cairo-medium text-[11px] text-[#111111]">
          قصتك
        </Text>
      </View>
    ) : null;

  return (
    <View testID="story-tray" className={`pb-3 pt-1 ${className}`}>
      <FlatList
        horizontal
        data={authors}
        keyExtractor={(a) => a.author.identityId}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        ListHeaderComponent={own}
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
