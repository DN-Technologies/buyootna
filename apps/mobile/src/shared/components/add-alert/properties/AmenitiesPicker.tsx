import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { View } from 'react-native';

import DrawerTrigger from '@/shared/components/filters/DrawerTrigger';
import SelectionDrawer, {
  SelectionItem,
} from '@/shared/components/filters/SelectionDrawer';

import { AMENITIES_OPTIONS } from './constants';

export interface AmenitiesPickerProps {
  value: SelectionItem[];
  onChange: (items: SelectionItem[]) => void;
}

// المزايا multi-select
export default function AmenitiesPicker({ value, onChange }: AmenitiesPickerProps) {
  const drawerRef = useRef<BottomSheetModal>(null);

  const label =
    value.length > 0 ? value.map((item) => item.label).join('، ') : undefined;

  return (
    <>
      <View className="mb-6 w-full">
        <DrawerTrigger
          label="المزايا"
          placeholder="اختر ما ترغب في البحث عنه"
          value={label}
          onPress={() => drawerRef.current?.present()}
        />
      </View>

      <SelectionDrawer
        ref={drawerRef}
        title="اختر المزايا"
        data={AMENITIES_OPTIONS}
        multiSelect
        selectedItems={value}
        onSelectMultiple={onChange}
      />
    </>
  );
}
