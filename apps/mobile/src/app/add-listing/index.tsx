import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
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

import SharedPropertyInfo from '@/app/add-listing/SharedPropertyInfo';
import ExchangePropertyTab from '@/app/add-listing/tabs/ExchangePropertyTab';
import RentPropertyTab from '@/app/add-listing/tabs/RentPropertyTab';
import SellPropertyTab from '@/app/add-listing/tabs/SellPropertyTab';
import ImageUploadZone from '@/shared/components/add-listing/ImageUploadZone';
import { useListingStore } from '@/shared/store/useListingStore';

export default function CreateListingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    listingType,
    setListingType,
    governorate,
    area,
    propertyCategory,
    areaSize,
    adDetails,
    phoneNumber,
    price,
    showPrice,
    monthlyRent,
    requestYear,
    requiredYear,
    fetchFeatures,
  } = useListingStore();

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const handlePreview = () => {
    router.push('/add-listing/preview');
  };

  // Validate required fields based on the selected listing type
  const isBaseValid =
    !!governorate &&
    !!area &&
    !!propertyCategory &&
    !!areaSize &&
    !!adDetails &&
    !!phoneNumber;

  let isTypeValid = true;
  if (listingType === 'sell') {
    isTypeValid = !showPrice || !!price;
  } else if (listingType === 'rent') {
    isTypeValid = !showPrice || !!monthlyRent;
  } else if (listingType === 'exchange') {
    isTypeValid = (!showPrice || !!price) && !!requestYear && !!requiredYear;
  }

  const isFormValid = isBaseValid && isTypeValid;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* --- Top Header --- */}
        <View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-50">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full"
            activeOpacity={0.7}
          >
            <Feather name="chevron-right" size={24} color="#111111" />
          </TouchableOpacity>
          <Text className="font-cairo-bold text-lg text-[#111111]">
            إضافة إعلان
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
        >
          <View className="px-5 pt-3">
            {/* --- Free Ad Promotional Banner --- */}
            <View className="mb-6 flex-row items-center justify-between rounded-xl bg-[#F5F7F9] p-4">
              <View className="flex-1 pl-3">
                <Text
                  className="mb-1 font-cairo-bold text-sm text-[#15304D]"
                  style={{ writingDirection: 'rtl' }}
                >
                  لديك إعلان مجاني واحد
                </Text>
                <Text
                  className="font-cairo-medium text-xs leading-5 text-[#6B6A6A]"
                  style={{ writingDirection: 'rtl' }}
                >
                  يمكنك نشر هذا الإعلان مجاناً، وبعده يمكنك شراء باقات إعلانية إضافية.
                </Text>
              </View>
              <Text className="text-3xl">🎉</Text>
            </View>

            {/* --- Ad Type Selection (نوع الإعلان) --- */}
            <View className="mb-6">
              <Text
                className="mb-3 font-cairo-semibold text-lg text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                نوع الإعلان
              </Text>

              <View className="flex-row items-center gap-8">
                {/* 1. بيع (Sale) */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setListingType('sell')}
                  className="flex-row items-center"
                >
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border-[1.5px] ${
                      listingType === 'sell'
                        ? 'border-[#15304D]'
                        : 'border-gray-300'
                    }`}
                  >
                    {listingType === 'sell' && (
                      <View className="h-2.5 w-2.5 rounded-full bg-[#15304D]" />
                    )}
                  </View>
                  <Text className="mx-2.5 font-cairo-medium text-[15px] text-[#111111]">
                    بيع
                  </Text>
                </TouchableOpacity>

                {/* 2. إيجار (Rent) */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setListingType('rent')}
                  className="flex-row items-center"
                >
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border-[1.5px] ${
                      listingType === 'rent'
                        ? 'border-[#15304D]'
                        : 'border-gray-300'
                    }`}
                  >
                    {listingType === 'rent' && (
                      <View className="h-2.5 w-2.5 rounded-full bg-[#15304D]" />
                    )}
                  </View>
                  <Text className="mx-2.5 font-cairo-medium text-[15px] text-[#111111]">
                    إيجار
                  </Text>
                </TouchableOpacity>

                {/* 3. بدل (Exchange) */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setListingType('exchange')}
                  className="flex-row items-center"
                >
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border-[1.5px] ${
                      listingType === 'exchange'
                        ? 'border-[#15304D]'
                        : 'border-gray-300'
                    }`}
                  >
                    {listingType === 'exchange' && (
                      <View className="h-2.5 w-2.5 rounded-full bg-[#15304D]" />
                    )}
                  </View>
                  <Text className="mx-2.5 font-cairo-medium text-[15px] text-[#111111]">
                    بدل
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* --- Shared Property Details --- */}
            <SharedPropertyInfo />

            {/* --- Conditional Tabs for Pricing & Details --- */}
            {listingType === 'sell' && <SellPropertyTab />}
            {listingType === 'rent' && <RentPropertyTab />}
            {listingType === 'exchange' && <ExchangePropertyTab />}

            {/* --- Image Upload Zone --- */}
            <ImageUploadZone />
          </View>
        </ScrollView>

        {/* --- Sticky Footer --- */}
        <View
          className="absolute bottom-0 w-full border-t border-gray-100 bg-white px-5 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePreview}
            disabled={!isFormValid}
            className={`h-[50px] w-full items-center justify-center rounded-full ${
              isFormValid ? 'bg-[#15304D]' : 'bg-[#A6A6A6]'
            }`}
          >
            <Text className="font-cairo-bold text-[15px] text-white">
              معاينة الاعلان
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
