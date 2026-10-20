import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ListRowSkeleton from '@/shared/components/skeletons/ListRowSkeleton';
import { useBlockedAccounts, useBlockFlow } from '@/shared/hooks/blocks/useBlocks';

/** Settings › «المحظورون»: the accounts you blocked, each with unblock. */
export default function BlockedAccountsScreen() {
  const router = useRouter();
  const { data: blocked = [], isLoading, refetch } = useBlockedAccounts();
  const { askToUnblock } = useBlockFlow();

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-4">
        <TouchableOpacity onPress={() => router.back()} className="w-8" accessibilityLabel="رجوع">
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
          المحظورون
        </Text>
        <View className="w-8" />
      </View>

      {isLoading ? (
        <View className="px-5 pt-5">
          {[1, 2, 3].map((key) => (
            <ListRowSkeleton key={key} showTrailing />
          ))}
        </View>
      ) : (
        <FlatList
          data={blocked}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, flexGrow: 1 }}
          ListEmptyComponent={
            <View testID="blocked-empty" className="flex-1 items-center justify-center gap-2 px-8">
              <Text className="font-cairo-semibold text-[16px] text-[#111111]">
                لا يوجد حسابات محظورة
              </Text>
              <Text className="text-center font-cairo-medium text-[13px] text-[#6B6A6A]">
                يمكنك حظر أي حساب من المحادثة أو من صفحته.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              testID={`blocked-${item.userId}`}
              className="flex-row items-center gap-3 border-b border-gray-50 py-3"
            >
              <View className="size-11 items-center justify-center overflow-hidden rounded-full bg-[#DEE3E8]">
                {item.avatarUrl ? (
                  <Image
                    source={{ uri: item.avatarUrl }}
                    contentFit="cover"
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <Text className="font-cairo-bold text-[16px] text-[#15304D]">
                    {item.name.trim().charAt(0)}
                  </Text>
                )}
              </View>
              <Text
                numberOfLines={1}
                className="flex-1 font-cairo-semibold text-[14px] text-[#111111]"
              >
                {item.name}
              </Text>
              <TouchableOpacity
                testID={`unblock-${item.userId}`}
                onPress={() => askToUnblock(item.userId, item.name)}
                className="rounded-full border border-[#15304D] px-4 py-1.5"
              >
                <Text className="font-cairo-semibold text-[12px] text-[#15304D]">
                  إلغاء الحظر
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
