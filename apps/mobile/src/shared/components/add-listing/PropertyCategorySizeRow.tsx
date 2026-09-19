import { Text, TextInput, View } from 'react-native';

import { LockIcon } from '@/assets/icons/home/property';
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
  return (
    <View className="mb-2 w-full flex-row gap-3" style={{ gap: 12 }}>
      <DrawerTrigger
        label="فئة العقار"
        placeholder="اختر نوع عقارك"
        value={propertyCategory?.label}
        onPress={onPressCategory}
        required={true}
        disabled={isEdit && !!propertyCategory}
        locked={isEdit && !!propertyCategory}
      />

      {/* Area Size */}
      <View className="mb-6 flex-1" style={{ flex: 1 }}>
        <Text
          className="mb-1 font-cairo-medium text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          المساحة <Text className="text-red-500">*</Text>
        </Text>
        <View
          className={`h-[40px] w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] px-4 py-3 ${isEdit ? 'bg-gray-50' : 'bg-white'}`}
          style={{ width: '100%', gap: 8 }}
        >
          <TextInput
            className="h-6 flex-1 text-right font-cairo-semibold text-[#111111]"
            style={{ flex: 1, textAlign: 'right' }}
            placeholder="300 م2"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={areaSize}
            onChangeText={(text) => onChangeAreaSize(toWesternDigits(text))}
            editable={!isEdit || !areaSize}
          />
          <View className="flex-row items-center gap-1.5">
            <Text className="font-cairo-medium text-xs text-[#94A3B8]">م²</Text>
            {isEdit && !!areaSize && <LockIcon size={14} color="#94A3B8" />}
          </View>
        </View>
      </View>
    </View>
  );
}
