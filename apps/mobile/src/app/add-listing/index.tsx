import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import SellPropertyTab from '@/app/add-listing/SellPropertyTab';
import SharedPropertyInfo from '@/app/add-listing/SharedPropertyInfo';
import { useListingStore } from '@/core/store/useListingStore';

export default function CreateListingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Connect to our Zustand store
  const { listingType, setListingType } = useListingStore();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-row items-center justify-between px-5 py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-8 w-8 items-center justify-center"
          >
            <Image
              source={require('@/assets/icons/arrow-back.svg')}
              style={{ width: 12, height: 16 }}
            />
          </TouchableOpacity>
          <Text className="font-cairo-bold text-lg text-[#111111]">
            إضافة إعلان
          </Text>
          <View className="w-8" />
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
        >
          <View className="px-5 pt-2">
            <View className="mb-8 flex-row items-center justify-between gap-4 rounded-lg bg-[#F4F8FB] p-5">
              <Text className="text-2xl">🎉</Text>
              <View className="mr-4 flex-1">
                <Text
                  className="mb-1 font-cairo-semibold text-sm text-[#15304D]"
                  style={{ writingDirection: 'rtl' }}
                >
                  لديك إعلان مجاني واحد
                </Text>
                <Text
                  className="font-cairo-medium text-xs leading-5 text-[#6B6A6A]"
                  style={{ writingDirection: 'rtl' }}
                >
                  يمكنك نشر هذا الإعلان مجاناً، وبعده يمكنك شراء باقات إعلانية
                  إضافية.
                </Text>
              </View>
            </View>

            <View className="mb-8">
              <Text
                className="mb-4 font-cairo-semibold text-lg text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                نوع الإعلان
              </Text>

              <View className="flex-row items-center gap-10">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setListingType('sell')}
                  className="flex-row items-center"
                >
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border-[1.5px] ${listingType === 'sell' ? 'border-[#15304D]' : 'border-gray-300'}`}
                  >
                    {listingType === 'sell' && (
                      <View className="h-2.5 w-2.5 rounded-full bg-[#15304D]" />
                    )}
                  </View>
                  <Text className="ml-3 font-cairo-medium text-[15px] text-[#111111]">
                    بيع
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setListingType('rent')}
                  className="ml-6 flex-row items-center"
                >
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border-[1.5px] ${listingType === 'rent' ? 'border-[#15304D]' : 'border-gray-300'}`}
                  >
                    {listingType === 'rent' && (
                      <View className="h-2.5 w-2.5 rounded-full bg-[#15304D]" />
                    )}
                  </View>
                  <Text className="ml-3 font-cairo-medium text-[15px] text-[#111111]">
                    إيجار
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setListingType('exchange')}
                  className="ml-6 flex-row items-center"
                >
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border-[1.5px] ${listingType === 'exchange' ? 'border-[#15304D]' : 'border-gray-300'}`}
                  >
                    {listingType === 'exchange' && (
                      <View className="h-2.5 w-2.5 rounded-full bg-[#15304D]" />
                    )}
                  </View>
                  <Text className="ml-3 font-cairo-medium text-[15px] text-[#111111]">
                    بدل
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <SharedPropertyInfo />

              {/* Conditional Tabs */}
              {listingType === 'sell' && <SellPropertyTab />}
              {listingType === 'rent' && (
                <Text className="text-right text-gray-400">
                  Rent form goes here...
                </Text>
              )}
              {listingType === 'exchange' && (
                <Text className="text-right text-gray-400">
                  Exchange form goes here...
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
