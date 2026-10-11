import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { View } from 'react-native';

import DrawerTrigger from '@/shared/components/filters/DrawerTrigger';
import SelectionDrawer, {
  SelectionItem,
} from '@/shared/components/filters/SelectionDrawer';
import { showAlert } from '@/shared/utils/alert';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';

export interface LocationPickersProps {
  governorate: SelectionItem | null;
  area: SelectionItem | null;
  onGovernorateChange: (item: SelectionItem) => void;
  onAreaChange: (item: SelectionItem) => void;
}

// المحافظة / المنطقة triggers and their selection drawers. Areas are only
// selectable once a governorate is chosen.
export default function LocationPickers({
  governorate,
  area,
  onGovernorateChange,
  onAreaChange,
}: LocationPickersProps) {
  const govDrawerRef = useRef<BottomSheetModal>(null);
  const areaDrawerRef = useRef<BottomSheetModal>(null);

  const filteredAreas = governorate ? AREAS[governorate.id] || [] : [];

  return (
    <>
      <View className="mb-2 w-full flex-row gap-3">
        <DrawerTrigger
          label="المحافظة"
          required
          placeholder="اختر المحافظة"
          value={governorate?.label}
          onPress={() => govDrawerRef.current?.present()}
        />
        <DrawerTrigger
          label="المنطقة"
          optional
          placeholder="اختر المنطقة"
          value={area?.label}
          onPress={() => {
            if (!governorate) {
              showAlert('تنبيه', 'يرجى اختيار المحافظة أولاً', [
                { text: 'حسناً' },
              ]);
              return;
            }
            areaDrawerRef.current?.present();
          }}
        />
      </View>

      <SelectionDrawer
        ref={govDrawerRef}
        title="اختر المحافظة"
        data={GOVERNORATES}
        onSelect={onGovernorateChange}
      />
      <SelectionDrawer
        ref={areaDrawerRef}
        title="اختر المنطقة"
        data={filteredAreas}
        onSelect={onAreaChange}
      />
    </>
  );
}
