import { Text, View } from 'react-native';

import { LockIcon } from '@/assets/icons/home/property';
import FormField, {
  BoxTextInput,
  INPUT_BOX_CLASS,
} from '@/shared/components/add-listing/FormField';
import DrawerTrigger from '@/shared/components/filters/DrawerTrigger';
import { toWesternDigits } from '@/shared/utils/arabicNumerals';

interface SelectionItem {
  id: string;
  label: string;
}

interface PropertyCategorySizeRowProps {
  propertyCategory: SelectionItem | null;
  onPressCategory: () => void;
  isEdit: boolean;
  areaSize: string;
  onChangeAreaSize: (value: string) => void;
}

export default function PropertyCategorySizeRow({
  propertyCategory,
  onPressCategory,
  isEdit,
  areaSize,
  onChangeAreaSize,
}: PropertyCategorySizeRowProps) {
  const sizeLocked = isEdit && !!areaSize;

  return (
    <View className="w-full flex-row" style={{ gap: 8 }}>
      <DrawerTrigger
        label="فئة العقار"
        placeholder="اختر نوع عقارك"
        value={propertyCategory?.label}
        onPress={onPressCategory}
        required={true}
        size="lg"
        disabled={isEdit && !!propertyCategory}
        locked={isEdit && !!propertyCategory}
      />

      <FormField label="المساحة" required flex>
        <View
          className={`${INPUT_BOX_CLASS} ${isEdit ? 'bg-gray-50' : ''}`}
          style={{ gap: 8 }}
        >
          <BoxTextInput
            testID="input-area-size"
            placeholder="300 م2"
            keyboardType="numeric"
            value={areaSize}
            onChangeText={(text) => onChangeAreaSize(toWesternDigits(text))}
            editable={!sizeLocked}
          />
          {!!areaSize && (
            <Text className="font-cairo text-[14px] text-[#979797]">م2</Text>
          )}
          {sizeLocked && <LockIcon size={14} color="#94A3B8" />}
        </View>
      </FormField>
    </View>
  );
}
