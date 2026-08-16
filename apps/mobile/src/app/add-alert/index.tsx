import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AlertAuctionsTab, {
  AlertAuctionsState,
  DEFAULT_ALERT_AUCTIONS_STATE,
} from '@/shared/components/add-alert/AlertAuctionsTab';
import AlertPropertiesTab, {
  AlertPropertiesState,
  DEFAULT_ALERT_PROPERTIES_STATE,
} from '@/shared/components/add-alert/AlertPropertiesTab';
import AlertSuccessModal from '@/shared/components/add-alert/AlertSuccessModal';

type AlertTab = 'properties' | 'auctions';

export default function AddAlertScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AlertTab>('properties');
  const [propertiesState, setPropertiesState] = useState<AlertPropertiesState>(
    DEFAULT_ALERT_PROPERTIES_STATE,
  );
  const [auctionsState, setAuctionsState] = useState<AlertAuctionsState>(
    DEFAULT_ALERT_AUCTIONS_STATE,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const updatePropertiesField = <K extends keyof AlertPropertiesState>(
    field: K,
    value: AlertPropertiesState[K],
  ) => {
    setPropertiesState((prev) => ({ ...prev, [field]: value }));
  };

  const updateAuctionsField = <K extends keyof AlertAuctionsState>(
    field: K,
    value: AlertAuctionsState[K],
  ) => {
    setAuctionsState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const governorate =
      activeTab === 'properties'
        ? propertiesState.governorate
        : auctionsState.governorate;

    if (!governorate) {
      Alert.alert('تنبيه', 'يرجى اختيار المحافظة أولاً');
      return;
    }

    setIsSubmitting(true);
    // Simulate request submission
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    setShowSuccess(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* --- Header --- */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="w-8 items-end"
          >
            <Feather name="chevron-right" size={24} color="#111111" />
          </TouchableOpacity>
          <Text className="font-cairo-semibold text-lg text-[#111111]">
            إضافة تنبيه
          </Text>
          <View className="w-8" />
        </View>

        {/* --- Tabs --- */}
        <View className="flex-row items-center border-b border-gray-200 px-5">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('properties')}
            className={`flex-1 items-center border-b-2 pb-3 ${
              activeTab === 'properties'
                ? 'border-[#15304D]'
                : 'border-transparent'
            }`}
          >
            <Text
              className={
                activeTab === 'properties'
                  ? 'font-cairo-bold text-[#15304D]'
                  : 'font-cairo text-[#6B6A6A]'
              }
            >
              عقارات
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('auctions')}
            className={`flex-1 items-center border-b-2 pb-3 ${
              activeTab === 'auctions'
                ? 'border-[#15304D]'
                : 'border-transparent'
            }`}
          >
            <Text
              className={
                activeTab === 'auctions'
                  ? 'font-cairo-bold text-[#15304D]'
                  : 'font-cairo text-[#6B6A6A]'
              }
            >
              مزادات
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* --- Description --- */}
          <Text
            className="mb-6 text-center font-cairo-medium text-xs leading-5 text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            تابع العقارات والخدمات والمزادات التي تهمك ليصلك اشعار في حاله
            توافر الطلب.
          </Text>

          {activeTab === 'properties' ? (
            <AlertPropertiesTab
              value={propertiesState}
              onChange={updatePropertiesField}
            />
          ) : (
            <AlertAuctionsTab
              value={auctionsState}
              onChange={updateAuctionsField}
            />
          )}
        </ScrollView>

        {/* --- Submit Button --- */}
        <View className="border-t border-gray-100 px-5 py-4">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="h-12 w-full items-center justify-center rounded-full bg-[#15304D]"
          >
            <Text className="font-cairo-bold text-base text-white">
              إنشاء تنبيه
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <AlertSuccessModal
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
        onViewAlerts={() => {
          setShowSuccess(false);
          router.back();
        }}
        onReturnHome={() => {
          setShowSuccess(false);
          router.replace('/home');
        }}
      />
    </SafeAreaView>
  );
}
