import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActivitySuccessToast from '@/features/individual/components/activity/ActivitySuccessToast';
import ArchivedAdCard from '@/features/individual/components/activity/ads/ArchivedAdCard';
import DraftAdCard from '@/features/individual/components/activity/ads/DraftAdCard';
import { useActivityToast } from '@/features/individual/hooks/useActivityToast';
import { useAdActions } from '@/features/individual/hooks/useAdActions';
import OfficeAdSheets, {
  type OfficeAdSheetsHandle,
} from '@/features/office/properties/components/OfficeAdSheets';
import OfficeEmptyState from '@/features/office/properties/components/OfficeEmptyState';
import OfficePropertiesHeader from '@/features/office/properties/components/OfficePropertiesHeader';
import OfficePropertyStats from '@/features/office/properties/components/OfficePropertyStats';
import OptionsMenu, {
  type OptionsMenuItem,
} from '@/features/office/properties/components/OptionsMenu';
import OwnerGovernorateCard from '@/features/office/properties/components/OwnerGovernorateCard';
import UnderlineTabs from '@/features/office/properties/components/UnderlineTabs';
import {
  governorateSummaries,
  markDoneLabel,
  type OfficeTab,
} from '@/features/office/properties/officeProperties';
import {
  useOfficeBulkActions,
  useOfficeProperties,
} from '@/features/office/properties/useOfficeProperties';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import { useTabBarHeight } from '@/shared/hooks/device/useTabBarHeight';

/** «عقارات المكتب»: the office's own ads (Figma 4494:145517 / 145794). */
export default function OfficePropertiesScreen() {
  const router = useRouter();
  const { scrollContentBottomPadding } = useTabBarHeight();
  const data = useOfficeProperties();
  const bulk = useOfficeBulkActions();
  const { triggerToast, ...toast } = useActivityToast();
  const sheets = useRef<OfficeAdSheetsHandle>(null);
  const [tab, setTab] = useState<OfficeTab>('ads');
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const adActions = useAdActions({
    refetch: data.refetch,
    triggerToast,
    freeAdsRemaining: data.freeAdsRemaining,
    listedAds: data.ads,
  });

  const summaries = useMemo(() => governorateSummaries(data.ads), [data.ads]);
  const addAd = () => router.push('/(office)/add');

  const ask = (
    confirm: Parameters<OfficeAdSheetsHandle['confirm']>[0],
    ids: string[],
    action: 'hide' | 'show' | 'delete',
    done: string,
  ) =>
    sheets.current?.confirm(confirm, async () => {
      if (await bulk.run(action, ids)) triggerToast(done);
    });

  const shownIds = data.ads.filter((ad) => !ad.isHidden).map((ad) => ad.id);
  const hiddenIds = data.ads.filter((ad) => ad.isHidden).map((ad) => ad.id);
  const menuItems: OptionsMenuItem[] =
    tab === 'ads'
      ? [
          ...(shownIds.length
            ? [
                {
                  key: 'hide-all',
                  label: 'اخفاء جميع الاعلانات',
                  onPress: () =>
                    ask({ kind: 'hideAll', scope: 'all' }, shownIds, 'hide', 'تم إخفاء الإعلانات'),
                },
              ]
            : []),
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
          ...(data.ads.length
            ? [
                {
                  key: 'delete-all',
                  label: 'حذف الكل',
                  danger: true,
                  onPress: () =>
                    ask(
                      { kind: 'deleteAll', scope: 'all' },
                      data.ads.map((ad) => ad.id),
                      'delete',
                      'تم حذف الإعلانات',
                    ),
                },
              ]
            : []),
        ]
      : tab === 'drafts' && data.drafts.length
        ? [
            {
              key: 'delete-drafts',
              label: 'حذف جميع المسودات',
              danger: true,
              onPress: () =>
                ask(
                  { kind: 'deleteDrafts' },
                  data.drafts.map((d) => d.id),
                  'delete',
                  'تم حذف المسودات',
                ),
            },
          ]
        : [];

  const markDone = (propertyId: string) => {
    const ad = data.ads.find((a) => a.id === propertyId);
    if (!ad) return;
    sheets.current?.confirm(
      { kind: 'markDone', label: markDoneLabel(ad) },
      async () => {
        if (await bulk.markDone(propertyId)) triggerToast('تم نقل الإعلان إلى المؤرشفة');
      },
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await data.refetch();
    setRefreshing(false);
  };

  const tabs = [
    { id: 'ads' as const, label: 'الاعلانات' },
    { id: 'drafts' as const, label: `المسودات (${data.drafts.length})` },
    { id: 'archived' as const, label: 'المؤرشفة' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ContentContainer className="flex-1">
        <OfficePropertiesHeader
          title="عقارات المكتب"
          onAddPress={addAd}
          onMenuPress={menuItems.length ? () => setMenuOpen(true) : undefined}
        />
        <UnderlineTabs tabs={tabs} active={tab} onChange={setTab} testID="office-properties-tabs" />

        <ScrollView
          testID="office-properties-scroll"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: scrollContentBottomPadding }}
        >
          {data.isLoading || data.error ? (
            <View className="px-4">
              <OfficeEmptyState loading={data.isLoading} error={data.error} message="" />
            </View>
          ) : tab === 'ads' ? (
            <View style={{ gap: 16 }}>
              <OfficePropertyStats dashboard={data.dashboard} />
              <View className="px-4" style={{ gap: 12 }}>
                {summaries.map((summary) => (
                  <OwnerGovernorateCard
                    key={summary.governorateId}
                    summary={summary}
                    onPress={() =>
                      router.push({
                        pathname: '/office-governorate/[governorateId]',
                        params: { governorateId: summary.governorateId },
                      })
                    }
                  />
                ))}
              </View>
            </View>
          ) : tab === 'drafts' ? (
            <View className="px-4">
              {data.drafts.length === 0 ? (
                <OfficeEmptyState message="لا توجد مسودات حالياً" />
              ) : (
                data.drafts.map((draft) => (
                  <DraftAdCard
                    key={draft.id}
                    property={draft}
                    onPublishPress={() => adActions.handlePublishDraft(draft)}
                    onDeletePress={() => adActions.handleDeleteAd(draft.id)}
                  />
                ))
              )}
            </View>
          ) : (
            <View className="px-4">
              {data.archived.length === 0 ? (
                <OfficeEmptyState message="لا توجد إعلانات مؤرشفة حالياً" />
              ) : (
                data.archived.map((ad) => (
                  <ArchivedAdCard
                    key={ad.id}
                    property={ad}
                    onPress={() =>
                      router.push({
                        pathname: '/property/[id]',
                        // Archived ads open with their republish action
                        params: { id: ad.id, archived: 'true' },
                      })
                    }
                  />
                ))
              )}
            </View>
          )}
        </ScrollView>
      </ContentContainer>

      <OptionsMenu visible={menuOpen} items={menuItems} onClose={() => setMenuOpen(false)} />
      <OfficeAdSheets ref={sheets} adActions={adActions} onMarkDone={markDone} />
      <ActivitySuccessToast
        visible={toast.showToast}
        message={toast.toastMessage}
        subtitle={toast.toastSubtitle}
        bottomOffset={scrollContentBottomPadding}
        fadeAnim={toast.fadeAnim}
        slideAnim={toast.slideAnim}
      />
    </SafeAreaView>
  );
}
