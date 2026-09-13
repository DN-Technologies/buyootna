import { FlatList, View } from 'react-native';

import type { HomeServiceChip } from './mockData';
import SectionHeader from './SectionHeader';
import ServiceChip from './ServiceChip';

interface CompanyServicesSectionProps {
  services: HomeServiceChip[];
  onPressService?: (service: HomeServiceChip) => void;
}

export default function CompanyServicesSection({
  services,
  onPressService,
}: CompanyServicesSectionProps) {
  return (
    <View className="mt-6 gap-3">
      <SectionHeader title="الخدمات" />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mr-3">
            <ServiceChip
              service={item}
              onPress={onPressService ? () => onPressService(item) : undefined}
            />
          </View>
        )}
      />
    </View>
  );
}
