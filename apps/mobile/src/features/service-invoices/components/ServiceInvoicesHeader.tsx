import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface ServiceInvoicesHeaderProps {
  onBack: () => void;
  onExportAll: () => void;
  isExporting: boolean;
}

// Back, the title, and "export every invoice in the list as one PDF"
export default function ServiceInvoicesHeader({
  onBack,
  onExportAll,
  isExporting,
}: ServiceInvoicesHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onBack}
        className="w-8 items-end"
      >
        <Feather name="chevron-right" size={24} color="#111111" />
      </TouchableOpacity>
      <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
        فواتير الخدمات
      </Text>
      <TouchableOpacity
        testID="service-invoices-export-all"
        activeOpacity={0.7}
        disabled={isExporting}
        onPress={onExportAll}
        className="w-8 items-start justify-center"
      >
        {isExporting ? (
          <ActivityIndicator size="small" color="#15304D" />
        ) : (
          <Feather name="download" size={20} color="#111111" />
        )}
      </TouchableOpacity>
    </View>
  );
}
