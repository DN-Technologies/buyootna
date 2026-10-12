import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
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

import SharedPropertyInfo from '@/app/(individual)/add-listing/SharedPropertyInfo';
import ExchangePropertyTab from '@/app/(individual)/add-listing/tabs/ExchangePropertyTab';
import RentPropertyTab from '@/app/(individual)/add-listing/tabs/RentPropertyTab';
import SellPropertyTab from '@/app/(individual)/add-listing/tabs/SellPropertyTab';
import { plansService } from '@/shared/api/plans.service';
import ImageUploadZone from '@/shared/components/add-listing/ImageUploadZone';
import ListingTypeRadios from '@/shared/components/add-listing/ListingTypeRadios';
import { useContactPhonePrefill } from '@/shared/hooks/auth/useContactPhonePrefill';
import {
  isListingFormValid,
  useListingStore,
} from '@/shared/store/useListingStore';

export default function CreateListingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const store = useListingStore();
  const { listingType, setListingType, phoneNumber, fetchFeatures, updateField } =
    store;

  // A new ad's phone starts on your contact number
  const setPhoneNumber = useCallback(
    (phone: string) => updateField('phoneNumber', phone),
    [updateField],
  );
  useContactPhonePrefill(phoneNumber, setPhoneNumber);

  // The free-ad banner used to be a hardcoded "لديك إعلان مجاني واحد" shown
  // to everyone, contradicting the live balance on My Activity (QA ticket:
  // quota mismatch between My Activity and the Add Ad flow). Drive it from
  // the real wallet; the ['wallet'] key is shared with the account-balance
  // screen's cache.
  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => plansService.getWallet(),
    staleTime: 0,
  });
  const freeAdsRemaining = wallet?.freeAdsRemaining ?? 0;

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const handlePreview = () => {
    router.push('/add-listing/preview');
  };

  const isFormValid = isListingFormValid(store);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* --- Top Header --- */}
        <View className="h-[52px] flex-row items-center justify-between px-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-8 w-8 items-center justify-center rounded-full"
            activeOpacity={0.7}
          >
            <Feather name="chevron-right" size={22} color="#111111" />
          </TouchableOpacity>
          <Text className="font-cairo-semibold text-lg text-[#111111]">
            إضافة إعلان
          </Text>
          <View className="w-8" />
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 150 }}
        >
          <View className="px-4 pt-3" style={{ gap: 24 }}>
            {/* --- Free ad banner (only when the wallet actually has free
                 ads left; hidden otherwise so it can't contradict the My
                 Activity balance) --- */}
            {freeAdsRemaining > 0 && (
              <View
                className="flex-row items-center rounded-lg bg-[#F5F7F9] p-3"
                style={{ gap: 12 }}
              >
                <Image
                  source={require('@/assets/icons/add-listing/party-popper.svg')}
                  style={{ width: 32, height: 32 }}
                  contentFit="contain"
                />
                <View className="flex-1 py-1.5" style={{ gap: 6 }}>
                  <Text
                    className="font-cairo-semibold text-sm text-[#15304D]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    {freeAdsRemaining === 1
                      ? 'لديك إعلان مجاني واحد'
                      : `لديك ${freeAdsRemaining} إعلانات مجانية`}
                  </Text>
                  <Text
                    className="font-cairo-medium text-xs text-[#6B6A6A]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    يمكنك نشر هذا الإعلان مجاناً، وبعده يمكنك شراء باقات إعلانية إضافية.
                  </Text>
                </View>
              </View>
            )}

            <ListingTypeRadios value={listingType} onChange={setListingType} />

            <SharedPropertyInfo />

            {/* --- Price & details, by listing type --- */}
            {listingType === 'sell' && <SellPropertyTab />}
            {listingType === 'rent' && <RentPropertyTab />}
            {listingType === 'exchange' && <ExchangePropertyTab />}

            <ImageUploadZone />
          </View>
        </ScrollView>

        {/* --- Sticky Footer --- */}
        <View
          className="absolute bottom-0 w-full bg-white px-4 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <TouchableOpacity
            testID="preview-button"
            activeOpacity={0.85}
            onPress={handlePreview}
            disabled={!isFormValid}
            className={`h-12 w-full items-center justify-center rounded-full ${
              isFormValid ? 'bg-[#15304D]' : 'bg-[#A6A6A6]'
            }`}
          >
            <Text className="font-cairo-semibold text-sm text-white">
              معاينة الاعلان
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
