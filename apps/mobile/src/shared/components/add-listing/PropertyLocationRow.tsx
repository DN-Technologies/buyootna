import { View } from 'react-native';

import DrawerTrigger from '@/shared/components/filters/DrawerTrigger';
import { showAlert } from '@/shared/utils/alert';

interface SelectionItem {
  id: string;
  label: string;
}

interface PropertyLocationRowProps {
  governorate: SelectionItem | null;
  area: SelectionItem | null;
  isEdit: boolean;
  onPressGovernorate: () => void;
  onPressArea: () => void;
}

export default function PropertyLocationRow({
  governorate,
  area,
  isEdit,
  onPressGovernorate,
  onPressArea,
}: PropertyLocationRowProps) {
  return (
    <View className="mb-2 w-full flex-row gap-3" style={{ gap: 12 }}>
      <DrawerTrigger
        label="المحافظة"
        placeholder="اختر المحافظة"
        value={governorate?.label}
        onPress={onPressGovernorate}
        required={true}
        disabled={isEdit && !!governorate}
        locked={isEdit && !!governorate}
      />
      <DrawerTrigger
        label="المنطقة"
        placeholder="اختر المنطقة"
        value={area?.label}
        onPress={() => {
          if (!governorate) {
            showAlert('تنبيه', 'يرجى اختيار المحافظة أولاً', [
              { text: 'حسناً' },
            ]);
            return;
          }
          onPressArea();
        }}
        required={true}
        disabled={isEdit && !!area}
        locked={isEdit && !!area}
      />
    </View>
  );
}
