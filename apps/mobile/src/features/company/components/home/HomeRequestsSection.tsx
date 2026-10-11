import { useRouter } from 'expo-router';
import { FlatList, View } from 'react-native';

import { useReplyToRequest } from '@/features/company/hooks/useReplyToRequest';

import type { CompanyRequestItem } from '../requests/types';
import CompanyRequestCard from './CompanyRequestCard';
import SectionHeader from './SectionHeader';

// The home shows a taste of each list; "عرض الكل" opens the rest
const MAX_CARDS = 5;

interface HomeRequestsSectionProps {
  title: string;
  variant: 'company' | 'public';
  requests: CompanyRequestItem[];
}

/**
 * "طلبات خاصة بالشركة" / "طلبات عامة": a title row and a sideways list of
 * cards that runs off the screen edge. Renders nothing without requests,
 * as in the Figma frames of a company nobody has written to yet.
 */
export default function HomeRequestsSection({
  title,
  variant,
  requests,
}: HomeRequestsSectionProps) {
  const router = useRouter();
  const reply = useReplyToRequest();

  if (requests.length === 0) return null;

  return (
    <View testID={`home-requests-${variant}`} className="gap-3">
      <View className="px-4">
        <SectionHeader
          title={title}
          onPressViewAll={() => router.push('/(company)/company-requests')}
        />
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={requests.slice(0, MAX_CARDS)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        renderItem={({ item }) => (
          <CompanyRequestCard
            request={item}
            variant={variant}
            onReply={reply}
            onDetails={(request) =>
              router.push(`/(company)/(requests)/${request.id}`)
            }
          />
        )}
      />
    </View>
  );
}
