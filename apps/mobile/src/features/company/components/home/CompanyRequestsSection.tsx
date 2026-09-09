import { useRouter } from 'expo-router';
import { FlatList, View } from 'react-native';

import CompanyRequestCard from './CompanyRequestCard';
import type { CompanyRequest } from './mockData';
import SectionHeader from './SectionHeader';

interface CompanyRequestsSectionProps {
  requests: CompanyRequest[];
  onPressViewAll?: () => void;
}

export default function CompanyRequestsSection({
  requests,
  onPressViewAll,
}: CompanyRequestsSectionProps) {
  const router = useRouter();

  const handleViewAll =
    onPressViewAll || (() => router.push('/(company)/company-requests'));

  return (
    <View className="mt-6 gap-3">
      <SectionHeader
        title="طلبات خاصة بالشركة"
        onPressViewAll={handleViewAll}
      />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mr-4">
            <CompanyRequestCard request={item} variant="company" />
          </View>
        )}
      />
    </View>
  );
}
