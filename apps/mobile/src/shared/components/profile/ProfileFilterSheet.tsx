import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { forwardRef } from 'react';

import RadioSelectionSheet, {
  RadioOption,
} from '@/shared/components/profile/RadioSelectionSheet';

// Option Definitions matching Figma Design
export const SORT_OPTIONS: RadioOption[] = [
  { label: 'الكل', value: 'all' },
  { label: 'الأحدث أولاً', value: 'newest' },
  { label: 'الأقدم أولاً', value: 'oldest' },
  { label: 'التقييم (من الأقل للأعلى)', value: 'rating_asc' },
  { label: 'التقييم (من الأعلى للأقل)', value: 'rating_desc' },
];

export const PROPERTY_FILTER_OPTIONS: RadioOption[] = [
  { label: 'الكل', value: 'all' },
  { label: 'بيع', value: 'sale' },
  { label: 'ايجار', value: 'rent' },
  { label: 'بدل', value: 'exchange' },
];

interface SortBottomSheetProps {
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose?: () => void;
}

export const SortBottomSheet = forwardRef<
  BottomSheetModal,
  SortBottomSheetProps
>(({ selectedValue, onSelect, onClose }, ref) => {
  return (
    <RadioSelectionSheet
      ref={ref}
      title="الترتيب حسب"
      options={SORT_OPTIONS}
      selectedValue={selectedValue}
      onSelect={onSelect}
      onClose={onClose}
      snapPoints={['52%']}
    />
  );
});

SortBottomSheet.displayName = 'SortBottomSheet';

interface FilterBottomSheetProps {
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose?: () => void;
}

export const FilterBottomSheet = forwardRef<
  BottomSheetModal,
  FilterBottomSheetProps
>(({ selectedValue, onSelect, onClose }, ref) => {
  return (
    <RadioSelectionSheet
      ref={ref}
      title="تصفية العقارات"
      options={PROPERTY_FILTER_OPTIONS}
      selectedValue={selectedValue}
      onSelect={onSelect}
      onClose={onClose}
      snapPoints={['44%']}
    />
  );
});

FilterBottomSheet.displayName = 'FilterBottomSheet';
