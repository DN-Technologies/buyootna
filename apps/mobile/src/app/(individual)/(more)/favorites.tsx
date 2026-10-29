import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FavoriteCompanyCard from '@/features/individual/components/favorites/FavoriteCompanyCard';
import FavoritePropertyCard from '@/features/individual/components/favorites/FavoritePropertyCard';
import FavoritesEmptyState from '@/features/individual/components/favorites/FavoritesEmptyState';
import FavoritesHeader from '@/features/individual/components/favorites/FavoritesHeader';
import FavoritesList from '@/features/individual/components/favorites/FavoritesList';
import FavoritesOptionsSheet from '@/features/individual/components/favorites/FavoritesOptionsSheet';
import FavoritesSortSheet, {
  FavoritesSortOption,
} from '@/features/individual/components/favorites/FavoritesSortSheet';
import FavoritesSubHeader from '@/features/individual/components/favorites/FavoritesSubHeader';
import FavoritesTabs, {
  FavoritesTab,
} from '@/features/individual/components/favorites/FavoritesTabs';
import FavoritesUndoToast from '@/features/individual/components/favorites/FavoritesUndoToast';
import OfficeListCard from '@/features/individual/components/offices/OfficeListCard';
import { useFavoriteProperties } from '@/features/individual/hooks/useFavoriteProperties';
import { useFavoriteProviders } from '@/features/individual/hooks/useFavoriteProviders';
import { useFavoritesUndo } from '@/features/individual/hooks/useFavoritesUndo';
import {
  sortByRating,
  sortFavoriteProperties,
} from '@/features/individual/utils/favoritesSort';
import FavoriteCompanySkeleton from '@/shared/components/skeletons/FavoriteCompanySkeleton';
import FavoritePropertySkeleton from '@/shared/components/skeletons/FavoritePropertySkeleton';
import OfficeListSkeleton from '@/shared/components/skeletons/OfficeListSkeleton';
import {
  formatTimeAgo,
  getArabicCategoryLabel,
  shareProperty,
} from '@/shared/utils/helpers/property';
import { openChatWith } from '@/shared/utils/openChat';

// Each tab's placeholders look like its own cards
function ListLoading({ card: Card }: { card: React.ComponentType }) {
  return (
    <View>
      {[1, 2, 3, 4].map((key) => (
        <Card key={key} />
      ))}
    </View>
  );
}

export default function FavoritesScreen() {
  const router = useRouter();
  const favorites = useFavoriteProperties();
  const favoriteCompanies = useFavoriteProviders('COMPANY');
  const favoriteOffices = useFavoriteProviders('OFFICE');
  const undo = useFavoritesUndo();

  const [activeTab, setActiveTab] = useState<FavoritesTab>('properties');
  const [selectedSort, setSelectedSort] = useState<FavoritesSortOption>('all');

  const sortSheetRef = useRef<BottomSheetModal>(null);
  const optionsSheetRef = useRef<BottomSheetModal>(null);

  const sortedProperties = useMemo(
    () => sortFavoriteProperties(favorites.properties, selectedSort),
    [favorites.properties, selectedSort],
  );
  const sortedCompanies = useMemo(
    () => sortByRating(favoriteCompanies.items, selectedSort),
    [favoriteCompanies.items, selectedSort],
  );
  const sortedOffices = useMemo(
    () => sortByRating(favoriteOffices.items, selectedSort),
    [favoriteOffices.items, selectedSort],
  );

  const countByTab: Record<FavoritesTab, number> = {
    properties: sortedProperties.length,
    companies: sortedCompanies.length,
    offices: sortedOffices.length,
  };

  const loadingByTab: Record<FavoritesTab, boolean> = {
    properties: favorites.isLoading,
    companies: favoriteCompanies.isLoading,
    offices: favoriteOffices.isLoading,
  };

  const handleClearAll = async () => {
    const list =
      activeTab === 'properties'
        ? favorites
        : activeTab === 'companies'
          ? favoriteCompanies
          : favoriteOffices;
    undo.offerUndo(await list.removeAll());
  };

  const handleExplorePress = () => {
    router.push(
      activeTab === 'companies' ? '/(individual)/companies' : '/(individual)/home',
    );
  };

  const emptyState = <FavoritesEmptyState onExplorePress={handleExplorePress} />;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <FavoritesHeader
        onOptionsPress={() => optionsSheetRef.current?.present()}
        onBackPress={() => router.back()}
      />

      <FavoritesTabs
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedSort('all');
        }}
      />

      <FavoritesSubHeader
        activeTab={activeTab}
        totalCount={countByTab[activeTab]}
        isLoading={loadingByTab[activeTab]}
        onSortPress={() => sortSheetRef.current?.present()}
      />

      <View className="flex-1">
        {activeTab === 'properties' && (
          <FavoritesList
            data={sortedProperties}
            refreshing={favorites.isRefreshing}
            onRefresh={favorites.refresh}
            onEndReached={favorites.loadMore}
            emptyComponent={
              favorites.isLoading ? (
                <ListLoading card={FavoritePropertySkeleton} />
              ) : (
                emptyState
              )
            }
            renderItem={({ item }) => (
              <FavoritePropertyCard
                id={item.id}
                price={item.price}
                listingType={item.type}
                // The API sends the category's code (VILLA): shown in Arabic
                categoryLabel={getArabicCategoryLabel(item.category) || 'عقار'}
                location={item.location || 'شمال غرب صليبيخات'}
                area={item.area || 200}
                propertyIncome={item.propertyIncome ?? 0}
                isFeatured={item.isFeatured ?? true}
                onPress={() => router.push(`/property/${item.id}`)}
                onFavoriteToggle={async () =>
                  undo.offerUndo(await favorites.remove(item))
                }
                onShare={() => shareProperty(item as any)}
              />
            )}
          />
        )}

        {activeTab === 'companies' && (
          <FavoritesList
            data={sortedCompanies}
            refreshing={favoriteCompanies.isRefreshing}
            onRefresh={favoriteCompanies.refresh}
            onEndReached={favoriteCompanies.loadMore}
            emptyComponent={
              favoriteCompanies.isLoading ? (
                <ListLoading card={FavoriteCompanySkeleton} />
              ) : (
                emptyState
              )
            }
            renderItem={({ item }) => (
              <FavoriteCompanyCard
                id={item.id}
                name={item.name}
                category={item.category}
                rating={item.rating}
                reviewsCount={item.reviewsCount}
                projectsCount={item.projectsCount}
                lastActivity={formatTimeAgo(item.lastActivityAt)}
                logoUrl={item.logoUrl}
                isVerified={item.isVerified}
                onPress={() => router.push(`/company/${item.id}`)}
                onFavoriteToggle={async () =>
                  undo.offerUndo(await favoriteCompanies.remove(item))
                }
                onQuoteRequest={() =>
                  router.push(
                    `/(individual)/request-quote?companyId=${item.id}` as any,
                  )
                }
                onChatPress={() => openChatWith(router, { recipientId: item.id })}
              />
            )}
          />
        )}

        {activeTab === 'offices' && (
          <FavoritesList
            data={sortedOffices}
            refreshing={favoriteOffices.isRefreshing}
            onRefresh={favoriteOffices.refresh}
            onEndReached={favoriteOffices.loadMore}
            emptyComponent={
              favoriteOffices.isLoading ? (
                <ListLoading card={OfficeListSkeleton} />
              ) : (
                emptyState
              )
            }
            renderItem={({ item }) => (
              <OfficeListCard
                id={item.id}
                name={item.name}
                rating={item.rating}
                reviewsCount={item.reviewsCount}
                location={item.location}
                logoUrl={item.logoUrl ?? undefined}
                isVerified={item.isVerified}
                propertiesCount={item.propertiesCount}
                listingTypes={item.listingTypes}
                servicesCount={item.servicesCount}
                phone={item.phone}
                whatsapp={item.whatsapp}
                isFavorite
                onPress={() => router.push(`/office/${item.id}` as any)}
                onToggleFavorite={async () =>
                  undo.offerUndo(await favoriteOffices.remove(item))
                }
                onChatPress={() => openChatWith(router, { recipientId: item.id })}
              />
            )}
          />
        )}
      </View>

      <FavoritesSortSheet
        ref={sortSheetRef}
        activeTab={activeTab}
        selectedSort={selectedSort}
        onSelectSort={setSelectedSort}
      />

      <FavoritesOptionsSheet ref={optionsSheetRef} onClearAll={handleClearAll} />

      <FavoritesUndoToast
        visible={undo.visible}
        onUndo={undo.undo}
        onDismiss={undo.dismiss}
      />
    </SafeAreaView>
  );
}
