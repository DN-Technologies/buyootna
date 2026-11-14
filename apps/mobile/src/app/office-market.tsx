import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  EMPTY_FILTERS_BY_TAB,
  EMPTY_HOME_FILTERS,
  hasHomeFilters,
  type HomeFiltersByTab,
  toPropertyFilterParams,
} from '@/features/individual/components/home/filter/homeFilter';
import HomeFilterSheet from '@/features/individual/components/home/filter/HomeFilterSheet';
import {
  HOME_SORT_OPTIONS,
  type HomeSort,
} from '@/features/individual/components/home/homeSort';
import OfficeMarketCard from '@/features/office/market/OfficeMarketCard';
import {
  type MarketTab,
  useOfficeMarket,
} from '@/features/office/market/useOfficeMarket';
import UnderlineTabs from '@/features/office/properties/components/UnderlineTabs';
import SelectionBottomSheet from '@/shared/components/feedback/SelectionBottomSheet';
import RadioSelectionSheet from '@/shared/components/profile/RadioSelectionSheet';
import PropertyCard from '@/shared/components/property/PropertyCard';
import { useFavorites } from '@/shared/hooks/properties/useFavorites';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';
import { shareProperty } from '@/shared/utils/helpers/property';
import { presentSheet } from '@/shared/utils/presentSheet';

const TABS: { id: MarketTab; label: string }[] = [
  { id: 'sale', label: 'بيع' },
  { id: 'rent', label: 'ايجار' },
  { id: 'exchange', label: 'بدل' },
];

type ViewMode = 'list' | 'card';

const ICONS = {
  back: require('@/assets/icons/office-properties/header-back.svg'),
  filter: require('@/assets/icons/home/topbar/filter.svg'),
  sort: require('@/assets/icons/home/topbar/sort.svg'),
  chevron: require('@/assets/icons/office-properties/chevron-down.svg'),
  list: require('@/assets/icons/home/topbar/view-list.svg'),
  photos: require('@/assets/icons/home/topbar/view-photos.svg'),
};

// المحافظة / المنطقة: a chip that opens its list; grey until it has a value
function PlaceChip({
  label,
  value,
  disabled,
  onPress,
  testID,
}: {
  label: string;
  value?: string;
  disabled?: boolean;
  onPress: () => void;
  testID: string;
}) {
  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      className="h-9 flex-1 flex-row items-center justify-between rounded-[16px] border border-[#ECECEC] bg-[#F9FAFE] px-3"
    >
      <Text
        numberOfLines={1}
        className={`shrink font-cairo-medium text-[13px] leading-[16px] ${
          disabled ? 'text-[#A0A0A0]' : 'text-[#111111]'
        }`}
        style={{ writingDirection: 'rtl' }}
      >
        {value || label}
      </Text>
      {/* As in the Figma: flipped, then turned a quarter */}
      <Image
        source={ICONS.chevron}
        style={{
          width: 15,
          height: 15,
          opacity: disabled ? 0.4 : 1,
          transform: [{ scaleY: -1 }, { rotate: '-90deg' }],
        }}
      />
    </TouchableOpacity>
  );
}

function RoundIconButton({
  icon,
  label,
  onPress,
  testID,
}: {
  icon: number;
  label: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      activeOpacity={0.7}
      onPress={onPress}
      className="h-8 w-8 items-center justify-center rounded-full border border-[#ECECEC] bg-[#F9FAFE]"
    >
      <Image source={icon} style={{ width: 17.6, height: 17.6 }} />
    </TouchableOpacity>
  );
}

/**
 * عقارات السوق for an office (Figma 4494:147645 بيع, 4494:147837 ايجار,
 * 4494:147888 بدل): every other advertiser's ads by deal type, filtered by
 * المحافظة / المنطقة and تصفية البحث, as a list or with photos.
 */
export default function OfficeMarketScreen() {
  const router = useRouter();
  const ownIdentityId = useAuthStore((s) => s.activeIdentity?.id);
  const { favoritedIds, toggleFavorite } = useFavorites();

  const [tab, setTab] = useState<MarketTab>('sale');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sort, setSort] = useState<HomeSort>('DEFAULT');
  const [filters, setFilters] = useState<HomeFiltersByTab>(EMPTY_FILTERS_BY_TAB);

  const governorateSheetRef = useRef<BottomSheetModal>(null);
  const areaSheetRef = useRef<BottomSheetModal>(null);
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const sortSheetRef = useRef<BottomSheetModal>(null);

  const current = filters[tab];
  const filterParams = useMemo(
    () =>
      hasHomeFilters(tab, current)
        ? toPropertyFilterParams(tab, current)
        : undefined,
    [tab, current],
  );
  const market = useOfficeMarket(tab, sort, filterParams, ownIdentityId);

  const governorate = GOVERNORATES.find((g) => g.id === current.governorateId);
  const areas = AREAS[current.governorateId] ?? [];
  const area = areas.find((a) => a.id === current.areaId);

  const setPlace = (governorateId: string, areaId: string) =>
    setFilters((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], governorateId, areaId },
    }));

  // «اقتراح لعميل»: its flow isn't designed yet (owner: show it for now)
  const suggest = () =>
    showAlert('قريباً', 'سيتوفر اقتراح العقار لعميل قريباً.');

  const header = (
    <View>
      {/* Back on the right, the title centred (the design's map icon on the
          left is empty, so its place is kept blank) */}
      <View className="h-[52px] flex-row items-center justify-between px-4 py-1.5">
        <TouchableOpacity
          testID="office-market-back"
          accessibilityRole="button"
          accessibilityLabel="رجوع"
          onPress={() => router.back()}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          <Image
            source={ICONS.back}
            style={{ width: 20, height: 20, transform: [{ scaleX: -1 }] }}
          />
        </TouchableOpacity>
        <Text
          numberOfLines={1}
          className="flex-1 text-center font-cairo-semibold text-[18px] leading-[23px] text-[#111111]"
        >
          عقارات السوق
        </Text>
        <View className="h-8 w-8" />
      </View>

      {/* المحافظة, المنطقة, then تصفية البحث and الترتيب */}
      <View className="mt-1 flex-row items-center px-4" style={{ gap: 8 }}>
        <PlaceChip
          testID="office-market-governorate"
          label="المحافظة"
          value={governorate?.label}
          onPress={() => presentSheet(governorateSheetRef)}
        />
        <PlaceChip
          testID="office-market-area"
          label="المنطقة"
          value={area?.label}
          disabled={!governorate}
          onPress={() => presentSheet(areaSheetRef)}
        />
        <RoundIconButton
          testID="office-market-filter"
          icon={ICONS.filter}
          label="تصفية البحث"
          onPress={() => presentSheet(filterSheetRef)}
        />
        <RoundIconButton
          testID="office-market-sort"
          icon={ICONS.sort}
          label="الترتيب حسب"
          onPress={() => presentSheet(sortSheetRef)}
        />
      </View>

      <View className="mt-1.5">
        <UnderlineTabs
          testID="office-market-tabs"
          tabs={TABS}
          active={tab}
          onChange={setTab}
        />
      </View>

      {/* The list / photos toggle, on the left */}
      <View className="flex-row justify-end px-4 pb-3 pt-3">
        <View className="flex-row items-center rounded-[12px] bg-[#F9FAFE]" style={{ gap: 2 }}>
          {(
            [
              { id: 'list', icon: ICONS.list, label: 'عرض سريع' },
              { id: 'card', icon: ICONS.photos, label: 'عرض بالصور' },
            ] as const
          ).map((option) => {
            const active = viewMode === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                testID={`office-market-view-${option.id}`}
                accessibilityRole="tab"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: active }}
                onPress={() => setViewMode(option.id)}
                className={`h-6 w-10 items-center justify-center rounded-[12px] ${
                  active ? 'bg-[#15304D]' : ''
                }`}
              >
                <Image
                  source={option.icon}
                  style={{ width: 16, height: 16 }}
                  tintColor={active ? '#FFFFFF' : '#111111'}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <FlatList
        testID="office-market-list"
        data={market.properties}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (market.hasNextPage && !market.isFetchingNextPage) {
            void market.fetchNextPage();
          }
        }}
        refreshControl={
          <RefreshControl
            refreshing={market.isRefetching && !market.isFetchingNextPage}
            onRefresh={() => void market.refetch()}
            colors={['#15304D']}
            tintColor="#15304D"
          />
        }
        renderItem={({ item }) => (
          <View className="px-4">
            {viewMode === 'list' ? (
              <OfficeMarketCard
                property={item}
                isFavorited={favoritedIds.includes(item.id)}
                onPress={() => router.push(`/property/${item.id}`)}
                onFavorite={() => void toggleFavorite(item.id)}
                onShare={() => void shareProperty(item)}
                onSuggest={suggest}
              />
            ) : (
              <PropertyCard
                id={item.id}
                images={item.images}
                price={item.price}
                isFeatured={item.isFeatured}
                type={item.type}
                categoryLabel={item.categoryLabel}
                propertyIncome={item.propertyIncome}
                requestYear={item.requestYear}
                requiredYear={item.requiredYear}
                area={item.area}
                location={item.location}
                isFavorited={favoritedIds.includes(item.id)}
                onFavorite={() => void toggleFavorite(item.id)}
                onShare={() => void shareProperty(item)}
                onPress={() => router.push(`/property/${item.id}`)}
              />
            )}
          </View>
        )}
        ListEmptyComponent={
          market.isLoading ? (
            <ActivityIndicator className="mt-10" color="#15304D" />
          ) : (
            <Text
              testID="office-market-empty"
              className="mt-10 px-6 text-center font-cairo text-[14px] text-[#6B6A6A]"
            >
              {market.isError
                ? 'تعذر تحميل العقارات، اسحب للأسفل لإعادة المحاولة'
                : 'لا توجد عقارات مطابقة'}
            </Text>
          )
        }
        ListFooterComponent={
          market.isFetchingNextPage ? (
            <ActivityIndicator className="my-4" color="#15304D" />
          ) : null
        }
      />

      <SelectionBottomSheet
        ref={governorateSheetRef}
        title="المحافظة"
        options={GOVERNORATES.map((g) => g.label)}
        selectedValue={governorate?.label}
        onSelect={(label) => {
          const picked = GOVERNORATES.find((g) => g.label === label);
          // Another governorate has other areas
          if (picked) setPlace(picked.id, '');
        }}
      />
      <SelectionBottomSheet
        ref={areaSheetRef}
        title="المنطقة"
        options={areas.map((a) => a.label)}
        selectedValue={area?.label}
        onSelect={(label) => {
          const picked = areas.find((a) => a.label === label);
          if (picked) setPlace(current.governorateId, picked.id);
        }}
      />
      <RadioSelectionSheet
        ref={sortSheetRef}
        title="الترتيب حسب"
        options={HOME_SORT_OPTIONS}
        selectedValue={sort}
        onSelect={(value) => setSort(value as HomeSort)}
      />
      <HomeFilterSheet
        ref={filterSheetRef}
        initialTab={tab}
        tabs={['sale', 'rent', 'exchange']}
        applied={filters}
        onApply={(filterTab, value) => {
          if (filterTab === 'offices') return;
          setFilters((prev) => ({ ...prev, [filterTab]: value }));
          setTab(filterTab);
        }}
        onReset={(filterTab) =>
          setFilters((prev) => ({ ...prev, [filterTab]: EMPTY_HOME_FILTERS }))
        }
      />
    </SafeAreaView>
  );
}
