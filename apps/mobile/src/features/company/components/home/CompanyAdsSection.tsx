import { FlatList, View } from 'react-native';

import type { ActivityItem } from '@/features/individual/hooks/useMyActivity';

import CompanyAdCard from './CompanyAdCard';
import SectionHeader from './SectionHeader';

interface CompanyAdsSectionProps {
  ads: ActivityItem[];
}

export default function CompanyAdsSection({ ads }: CompanyAdsSectionProps) {
  if (!ads || ads.length === 0) {
    return null;
  }

  return (
    <View className="mt-6 gap-3">
      <SectionHeader title="الاعلانات" />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        data={ads.slice(0, 5)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mr-3">
            <CompanyAdCard ad={item} />
          </View>
        )}
      />
    </View>
  );
}
