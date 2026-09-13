import { useRouter } from 'expo-router';
import { FlatList, View } from 'react-native';

import type { ConversationSummary } from '@/shared/api/chat.service';

import HomeConversationCard from './HomeConversationCard';
import SectionHeader from './SectionHeader';

interface CompanyConversationsSectionProps {
  conversations: ConversationSummary[];
  onPressViewAll?: () => void;
}

export default function CompanyConversationsSection({
  conversations,
  onPressViewAll,
}: CompanyConversationsSectionProps) {
  const router = useRouter();

  if (!conversations || conversations.length === 0) {
    return null;
  }

  const handleViewAll =
    onPressViewAll || (() => router.push('/(company)/company-chats'));

  return (
    <View className="mt-6 gap-3">
      <SectionHeader
        title="أحدث المحادثات"
        onPressViewAll={handleViewAll}
      />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        data={conversations.slice(0, 5)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mr-4">
            <HomeConversationCard conversation={item} />
          </View>
        )}
      />
    </View>
  );
}
