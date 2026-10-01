import { Feather, Ionicons } from '@expo/vector-icons';
import { TextInput, TouchableOpacity, View } from 'react-native';

interface ServiceInvoicesSearchBarProps {
  value: string;
  onChange: (text: string) => void;
  onOpenSort: () => void;
}

export default function ServiceInvoicesSearchBar({
  value,
  onChange,
  onOpenSort,
}: ServiceInvoicesSearchBarProps) {
  return (
    <View className="flex-row items-center gap-2 px-5 pb-3">
      <View className="h-11 flex-1 flex-row items-center gap-2 rounded-full bg-[#F5F7F9] px-4">
        <Feather name="search" size={18} color="#6B6A6A" />
        <TextInput
          testID="service-invoices-search"
          value={value}
          onChangeText={onChange}
          placeholder="بحث باسم أو رقم الفاتورة..."
          placeholderTextColor="#A6A6A6"
          returnKeyType="search"
          className="flex-1 font-cairo text-[13px] text-[#111111]"
          style={{ textAlign: 'right', writingDirection: 'rtl' }}
        />
      </View>
      <TouchableOpacity
        testID="service-invoices-sort"
        activeOpacity={0.7}
        onPress={onOpenSort}
        className="h-11 w-11 items-center justify-center rounded-full bg-[#F5F7F9]"
      >
        <Ionicons name="filter" size={18} color="#111111" />
      </TouchableOpacity>
    </View>
  );
}
