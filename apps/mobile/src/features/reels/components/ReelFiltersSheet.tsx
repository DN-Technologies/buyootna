import { BottomSheetBackdrop, type BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetModal as Sheet } from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import InlineDropdown from '@/shared/components/filters/InlineDropdown';
import GoldSegment, {
  type GoldSegmentOption,
} from '@/shared/components/ui/GoldSegment';
import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';

import type { ReelFilters } from '../types';

type Deal = 'all' | NonNullable<ReelFilters['listingType']>;

// In reading order: «الكل» on the right
const DEALS: GoldSegmentOption<Deal>[] = [
  { id: 'all', label: 'الكل' },
  { id: 'SALE', label: 'بيع' },
  { id: 'RENT', label: 'إيجار' },
  { id: 'EXCHANGE', label: 'بدل' },
];

/** The filters with empty choices left out, so "no filter" is really empty. */
export function cleanFilters(filters: ReelFilters): ReelFilters {
  return {
    ...(filters.governorateId ? { governorateId: filters.governorateId } : {}),
    ...(filters.governorateId && filters.areaId
      ? { areaId: filters.areaId }
      : {}),
    ...(filters.listingType ? { listingType: filters.listingType } : {}),
  };
}

export const hasReelFilters = (filters: ReelFilters) =>
  Object.keys(cleanFilters(filters)).length > 0;

interface ReelFiltersSheetProps {
  value: ReelFilters;
  onApply: (filters: ReelFilters) => void;
  onClose?: () => void;
}

/**
 * Narrows the feed by the deal and where the listing is. A draft until
 * «عرض النتائج»; «إعادة التعيين» clears it.
 */
const ReelFiltersSheet = forwardRef<BottomSheetModal, ReelFiltersSheetProps>(
  ({ value, onApply, onClose }, ref) => {
    const [draft, setDraft] = useState<ReelFilters>(value);

    useEffect(() => setDraft(value), [value]);

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      ),
      [],
    );

    const close = () =>
      (ref as React.RefObject<BottomSheetModal | null>).current?.dismiss();

    const areas = draft.governorateId ? (AREAS[draft.governorateId] ?? []) : [];

    return (
      <Sheet
        ref={ref}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        onDismiss={onClose}
      >
        <SafeBottomSheetView>
          <View testID="reel-filters" className="px-[16px] pt-[8px]">
            <Text className="mb-[16px] text-center font-cairo-bold text-[16px] text-[#111111]">
              تصفية الفيديوهات
            </Text>
            <Text className="mb-[8px] font-cairo text-[12px] leading-[18px] text-[#6B6A6A]">
              تظهر فقط الفيديوهات المرتبطة بإعلان مطابق
            </Text>
            <View className="mb-[20px] flex-row">
              <GoldSegment
                testID="reel-filter-deal"
                options={DEALS}
                value={draft.listingType ?? 'all'}
                onChange={(deal) =>
                  setDraft((d) => ({
                    ...d,
                    listingType: deal === 'all' ? undefined : deal,
                  }))
                }
              />
            </View>
            <InlineDropdown
              testID="reel-filter-governorate"
              title="المحافظة"
              placeholder="كل المحافظات"
              options={GOVERNORATES}
              value={draft.governorateId ?? ''}
              onChange={(governorateId) =>
                setDraft((d) => ({
                  ...d,
                  governorateId,
                  areaId:
                    d.governorateId === governorateId ? d.areaId : undefined,
                }))
              }
            />
            <InlineDropdown
              testID="reel-filter-area"
              title="المنطقة"
              placeholder="كل المناطق"
              options={areas}
              value={draft.areaId ?? ''}
              disabled={!draft.governorateId}
              onChange={(areaId) => setDraft((d) => ({ ...d, areaId }))}
            />
            <View className="flex-row pb-[12px]" style={{ gap: 10 }}>
              <TouchableOpacity
                testID="reel-filters-apply"
                activeOpacity={0.85}
                onPress={() => {
                  onApply(cleanFilters(draft));
                  close();
                }}
                className="h-[46px] flex-1 items-center justify-center rounded-full bg-[#15304D]"
              >
                <Text className="font-cairo-bold text-[14px] text-white">
                  عرض النتائج
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="reel-filters-clear"
                activeOpacity={0.85}
                onPress={() => {
                  setDraft({});
                  onApply({});
                  close();
                }}
                className="h-[46px] items-center justify-center rounded-full border border-[#15304D] px-[20px]"
              >
                <Text className="font-cairo-semibold text-[14px] text-[#15304D]">
                  إعادة التعيين
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeBottomSheetView>
      </Sheet>
    );
  },
);

ReelFiltersSheet.displayName = 'ReelFiltersSheet';

export default ReelFiltersSheet;
