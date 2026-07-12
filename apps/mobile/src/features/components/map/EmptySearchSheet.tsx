import { Text, TouchableOpacity, View } from 'react-native';

interface EmptySearchSheetProps {
  activeCategory: string;
  onModifyFilters: () => void;
  onShowAll: () => void;
}

export function EmptySearchSheet({
  activeCategory,
  onModifyFilters,
  onShowAll,
}: EmptySearchSheetProps) {
  // Dynamically generate the localized empty message based on the active tab
  const getEmptyMessage = () => {
    switch (activeCategory) {
      case 'ايجار':
        return 'لا توجد عقارات للايجار في هذه المنطقة حالياً';
      case 'بدل':
        return 'لا توجد عقارات للبدل في هذه المنطقة حالياً';
      case 'شركات':
        return 'لا توجد شركات هندسية في هذه المنطقة حالياً';
      case 'بيع':
      default:
        return 'لا توجد عقارات للبيع في هذه المنطقة حالياً';
    }
  };

  return (
    <View className="mx-5 items-end rounded-2xl border border-gray-100 bg-white p-5 shadow-lg shadow-gray-400/30">
      {/* Title */}
      <Text className="mb-4 text-right font-cairo-bold text-[15px] text-[#111111]">
        {getEmptyMessage()}
      </Text>

      {/* Action Buttons */}
      <View className="w-full flex-row items-center justify-end space-x-4 space-x-reverse">
        <TouchableOpacity activeOpacity={0.7} onPress={onShowAll}>
          <Text className="font-cairo-bold text-[13px] text-[#64748B]">
            عرض كل العقارات
          </Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} onPress={onModifyFilters}>
          <Text className="font-cairo-bold text-[13px] text-[#15304D]">
            تعديل الفلاتر
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
