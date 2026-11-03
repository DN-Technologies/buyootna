import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import ActivitySuccessToast from '@/features/individual/components/activity/ActivitySuccessToast';
import { useActivityToast } from '@/features/individual/hooks/useActivityToast';
import { useAdActions } from '@/features/individual/hooks/useAdActions';
import MultiSelectBar from '@/features/office/properties/components/MultiSelectBar';
import OfficeAdCard from '@/features/office/properties/components/OfficeAdCard';
import OfficeAdSheets, {
  type OfficeAdSheetsHandle,
  type OfficeConfirm,
} from '@/features/office/properties/components/OfficeAdSheets';
import OfficeEmptyState from '@/features/office/properties/components/OfficeEmptyState';
import OfficePropertiesHeader from '@/features/office/properties/components/OfficePropertiesHeader';
import OptionsMenu, {
  type OptionsMenuItem,
} from '@/features/office/properties/components/OptionsMenu';
import UnderlineTabs from '@/features/office/properties/components/UnderlineTabs';
import {
  areasOf,
  dealCounts,
  GOVERNORATE_FILTER_OPTIONS,
  GOVERNORATE_SORT_OPTIONS,
  type GovernorateAdFilter,
  governorateAds,
  type GovernorateAdSort,
  markDoneLabel,
  visibleAds,
} from '@/features/office/properties/officeProperties';
import {
  useOfficeBulkActions,
  useOfficeProperties,
} from '@/features/office/properties/useOfficeProperties';
import SelectionDrawer from '@/shared/components/filters/SelectionDrawer';
import RadioSelectionSheet from '@/shared/components/profile/RadioSelectionSheet';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import {
  governorateTitle,
  OFFICE_DEAL_TABS,
  type OfficeDeal,
} from '@/shared/utils/office/officeListings';

/** One governorate of the office's own ads (Figma 4494:145820). */
export default function OfficeGovernorateAdsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { governorateId = 'other' } = useLocalSearchParams<{
    governorateId: string;
  }>();
  const data = useOfficeProperties();
  const bulk = useOfficeBulkActions();
  const { triggerToast, ...toast } = useActivityToast();
  const sheets = useRef<OfficeAdSheetsHandle>(null);
  const filterRef = useRef<BottomSheetModal>(null);
  const sortRef = useRef<BottomSheetModal>(null);
  const areaRef = useRef<any>(null);

  const [areaId, setAreaId] = useState<string | null>(null);
  const [deal, setDeal] = useState<OfficeDeal>('SALE');
  const [filter, setFilter] = useState<GovernorateAdFilter>('ALL');
  const [sort, setSort] = useState<GovernorateAdSort>('ALL');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const inGovernorate = useMemo(
    () => governorateAds(data.ads, governorateId, areaId),
    [data.ads, governorateId, areaId],
  );
  const counts = useMemo(() => dealCounts(inGovernorate), [inGovernorate]);
  const shown = useMemo(
    () => visibleAds(inGovernorate, deal, filter, sort),
    [inGovernorate, deal, filter, sort],
  );
  const areas = areasOf(governorateId);
  const area = areas.find((a) => a.id === areaId) ?? null;

  const adActions = useAdActions({
    refetch: data.refetch,
    triggerToast,
    freeAdsRemaining: data.freeAdsRemaining,
    listedAds: inGovernorate,
  });

  const stopSelecting = () => {
    setSelecting(false);
    setPicked(new Set());
  };

  const ask = (
    confirm: OfficeConfirm,
    ids: string[],
    action: 'hide' | 'show' | 'delete',
    done: string,
  ) =>
    sheets.current?.confirm(confirm, async () => {
      if (await bulk.run(action, ids)) {
        stopSelecting();
        triggerToast(done);
      }
    });

  const shownIds = inGovernorate.filter((ad) => !ad.isHidden).map((ad) => ad.id);
  const hiddenIds = inGovernorate.filter((ad) => ad.isHidden).map((ad) => ad.id);

  // Figma 4494:147363 (with hidden ads) / 5734:146977 (without)
  const menuItems: OptionsMenuItem[] = inGovernorate.length
    ? [
        { key: 'multi-select', label: 'تحديد متعدد', onPress: () => setSelecting(true) },
        ...(hiddenIds.length
          ? [
              {
                key: 'show-hidden',
                label: 'اظهار الاعلانات المخفية',
                onPress: () =>
                  ask({ kind: 'showHidden' }, hiddenIds, 'show', 'تم إظهار الإعلانات'),
              },
            ]
          : []),
        ...(shownIds.length
          ? [
              {
                key: 'hide-all',
                label: 'اخفاء جميع الاعلانات',
                onPress: () =>
                  ask(
                    { kind: 'hideAll', scope: 'governorate' },
                    shownIds,
                    'hide',
                    'تم إخفاء الإعلانات',
                  ),
              },
            ]
          : []),
        {
          key: 'delete-all',
          label: 'حذف',
          danger: true,
          onPress: () =>
            ask(
              { kind: 'deleteAll', scope: 'governorate' },
              inGovernorate.map((ad) => ad.id),
              'delete',
              'تم حذف الإعلانات',
            ),
        },
      ]
    : [];

  const pickedAds = inGovernorate.filter((ad) => picked.has(ad.id));
  const togglePick = (id: string) =>
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const markDone = (propertyId: string) => {
    const ad = inGovernorate.find((a) => a.id === propertyId);
    if (!ad) return;
    sheets.current?.confirm({ kind: 'markDone', label: markDoneLabel(ad) }, async () => {
      if (await bulk.markDone(propertyId)) triggerToast('تم نقل الإعلان إلى المؤرشفة');
    });
  };

  const dealTabs = OFFICE_DEAL_TABS.map((t) => ({
    id: t.id,
    label: `${t.label} (${counts[t.id]})`,
  }));

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ContentContainer className="flex-1">
        <OfficePropertiesHeader
          title={governorateTitle(governorateId)}
          onBackPress={() => router.back()}
          onMenuPress={menuItems.length && !selecting ? () => setMenuOpen(true) : undefined}
        />

        {/* المنطقة, then the filter and sort buttons (RTL: dropdown on the right) */}
        <View className="flex-row items-center px-4 pt-3" style={{ gap: 8 }}>
          <TouchableOpacity
            testID="governorate-area"
            accessibilityRole="button"
            onPress={() => areaRef.current?.present()}
            disabled={areas.length === 0}
            className="h-9 flex-1 flex-row items-center justify-between rounded-2xl border border-[#ECECEC] bg-[#F9FAFE] pl-3 pr-3.5"
          >
            <Text
              numberOfLines={1}
              className="flex-1 font-cairo-medium text-[13px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              {area?.label ?? 'المنطقة'}
            </Text>
            <Image
              source={require('@/assets/icons/office-properties/chevron-down.svg')}
              // Figma turns this chevron a quarter (-90°) to point down
              style={{ width: 15, height: 15, transform: [{ rotate: '-90deg' }] }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            testID="governorate-filter"
            accessibilityRole="button"
            accessibilityLabel="التصفية"
            onPress={() => filterRef.current?.present()}
            className="h-8 w-8 items-center justify-center rounded-full border border-[#ECECEC] bg-[#F9FAFE]"
          >
            <Image
              source={require('@/assets/icons/office-properties/filter.svg')}
              style={{ width: 14, height: 12.5333 }}
            />
            {filter !== 'ALL' && (
              <View className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-[#15304D]" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            testID="governorate-sort"
            accessibilityRole="button"
            accessibilityLabel="الترتيب حسب"
            onPress={() => sortRef.current?.present()}
            className="h-8 w-8 items-center justify-center rounded-full border border-[#ECECEC] bg-[#F9FAFE]"
          >
            <Image
              source={require('@/assets/icons/office-properties/sort.svg')}
              style={{ width: 17.6, height: 17.6 }}
            />
          </TouchableOpacity>
        </View>

        <UnderlineTabs tabs={dealTabs} active={deal} onChange={setDeal} testID="governorate-deals" />

        <ScrollView
          testID="governorate-ads"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 12 }}
        >
          {data.isLoading || data.error ? (
            <OfficeEmptyState loading={data.isLoading} error={data.error} message="" />
          ) : shown.length === 0 ? (
            <OfficeEmptyState message="لا توجد إعلانات هنا حالياً" />
          ) : (
            shown.map((ad) => (
              <OfficeAdCard
                key={ad.id}
                ad={ad}
                onPress={() => adActions.handleOpenAd(ad)}
                selecting={selecting}
                selected={picked.has(ad.id)}
                onToggleSelect={() => togglePick(ad.id)}
              />
            ))
          )}
        </ScrollView>

        {selecting ? (
          <MultiSelectBar
            count={picked.size}
            anyHidden={pickedAds.some((ad) => ad.isHidden)}
            anyShown={pickedAds.length === 0 || pickedAds.some((ad) => !ad.isHidden)}
            onHide={() =>
              ask(
                { kind: 'hideSelected', count: pickedAds.filter((a) => !a.isHidden).length },
                pickedAds.filter((a) => !a.isHidden).map((a) => a.id),
                'hide',
                'تم إخفاء الإعلانات',
              )
            }
            onShow={() =>
              ask(
                { kind: 'showSelected', count: pickedAds.filter((a) => a.isHidden).length },
                pickedAds.filter((a) => a.isHidden).map((a) => a.id),
                'show',
                'تم إظهار الإعلانات',
              )
            }
            onDelete={() =>
              ask(
                { kind: 'deleteSelected', count: pickedAds.length },
                pickedAds.map((a) => a.id),
                'delete',
                'تم حذف الإعلانات',
              )
            }
            onCancel={stopSelecting}
            bottomInset={insets.bottom}
          />
        ) : (
          <View className="bg-white px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
            <TouchableOpacity
              testID="governorate-add-ad"
              activeOpacity={0.85}
              onPress={() => router.push('/(office)/add')}
              className="h-12 items-center justify-center rounded-3xl bg-[#15304D] px-5"
            >
              <Text className="font-cairo-semibold text-[14px] text-white">اضافة اعلان</Text>
            </TouchableOpacity>
          </View>
        )}
      </ContentContainer>

      <OptionsMenu visible={menuOpen} items={menuItems} onClose={() => setMenuOpen(false)} />
      <RadioSelectionSheet
        ref={filterRef}
        title="التصفية"
        options={GOVERNORATE_FILTER_OPTIONS}
        selectedValue={filter}
        onSelect={(value) => setFilter(value as GovernorateAdFilter)}
        snapPoints={['44%']}
      />
      <RadioSelectionSheet
        ref={sortRef}
        title="الترتيب حسب"
        options={GOVERNORATE_SORT_OPTIONS}
        selectedValue={sort}
        onSelect={(value) => setSort(value as GovernorateAdSort)}
        snapPoints={['50%']}
      />
      <SelectionDrawer
        ref={areaRef}
        title="المنطقة"
        data={[{ id: '', label: 'الكل' }, ...areas]}
        selectedItem={area ?? { id: '', label: 'الكل' }}
        onSelect={(item) => setAreaId(item.id || null)}
      />
      <OfficeAdSheets ref={sheets} adActions={adActions} onMarkDone={markDone} />
      <ActivitySuccessToast
        visible={toast.showToast}
        message={toast.toastMessage}
        subtitle={toast.toastSubtitle}
        bottomOffset={insets.bottom + 90}
        fadeAnim={toast.fadeAnim}
        slideAnim={toast.slideAnim}
      />
    </SafeAreaView>
  );
}
