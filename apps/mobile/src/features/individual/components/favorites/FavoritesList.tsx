import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { ReactElement } from 'react';
import { RefreshControl } from 'react-native';

interface FavoritesListProps<T extends { id: string }> {
  data: T[];
  renderItem: ListRenderItem<T>;
  emptyComponent: ReactElement;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
}

// The list layout every favorites tab shares
export default function FavoritesList<T extends { id: string }>({
  data,
  renderItem,
  emptyComponent,
  refreshing,
  onRefresh,
  onEndReached,
}: FavoritesListProps<T>) {
  return (
    <FlashList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 80,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor="#15304D"
          />
        ) : undefined
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={emptyComponent}
      renderItem={renderItem}
    />
  );
}
