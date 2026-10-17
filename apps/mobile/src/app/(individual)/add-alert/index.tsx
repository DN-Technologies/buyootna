import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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

import { useMyAlerts } from '@/features/individual/hooks/useMyAlerts';
import {
  alertToAuctionsState,
  alertToPropertiesState,
} from '@/features/individual/utils/alertForm';
import {
  alertsService,
  mapAuctionsStateToPayload,
  mapPropertiesStateToPayload,
} from '@/shared/api/alerts.service';
import AlertAuctionsTab, {
  AlertAuctionsState,
  DEFAULT_ALERT_AUCTIONS_STATE,
} from '@/shared/components/add-alert/AlertAuctionsTab';
import AlertPropertiesTab, {
  AlertPropertiesState,
  DEFAULT_ALERT_PROPERTIES_STATE,
} from '@/shared/components/add-alert/AlertPropertiesTab';
import AlertSuccessModal from '@/shared/components/add-alert/AlertSuccessModal';
import { FEATURES } from '@/shared/config/features';
import { getIdentityHomeRoute } from '@/shared/navigation/getIdentityHomeRoute';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

type AlertTab = 'properties' | 'auctions';

export default function AddAlertScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activeIdentity = useAuthStore((state) => state.activeIdentity);

  const [activeTab, setActiveTab] = useState<AlertTab>('properties');
  const [propertiesState, setPropertiesState] = useState<AlertPropertiesState>(
    DEFAULT_ALERT_PROPERTIES_STATE,
  );
  const [auctionsState, setAuctionsState] = useState<AlertAuctionsState>(
    DEFAULT_ALERT_AUCTIONS_STATE,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Edit mode: /add-alert?editId=<id> fills the form from the saved alert
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEdit = !!editId;
  const { data: myAlerts, isLoading: isLoadingAlerts } = useMyAlerts();
  const editingAlert = isEdit
    ? myAlerts.find((a) => a.id === editId)
    : undefined;
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!isEdit || hydratedRef.current || isLoadingAlerts) return;
    if (!editingAlert) {
      hydratedRef.current = true;
      showAlert('خطأ', 'التنبيه غير موجود أو تم حذفه');
      router.back();
      return;
    }
    hydratedRef.current = true;
    if (editingAlert.type === 'AUCTIONS') {
      setActiveTab('auctions');
      setAuctionsState(alertToAuctionsState(editingAlert));
    } else {
      setActiveTab('properties');
      setPropertiesState(alertToPropertiesState(editingAlert));
    }
  }, [isEdit, editingAlert, isLoadingAlerts, router]);

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
      showAlert('تنبيه', 'يرجى اختيار المحافظة أولاً');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload =
        activeTab === 'properties'
          ? mapPropertiesStateToPayload(propertiesState)
          : mapAuctionsStateToPayload(auctionsState);
      if (isEdit) {
        await alertsService.update(editId!, payload);
        // The activity screen refetches alerts on focus
        router.back();
      } else {
        await alertsService.create(payload);
        // Leave the form empty so the same alert can't be saved twice
        setPropertiesState(DEFAULT_ALERT_PROPERTIES_STATE);
        setAuctionsState(DEFAULT_ALERT_AUCTIONS_STATE);
        setShowSuccess(true);
      }
    } catch (err) {
      showAlert(
        'خطأ',
        getApiErrorMessage(
          err,
          isEdit ? 'فشل تعديل التنبيه' : 'فشل إنشاء التنبيه',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
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
            {isEdit ? 'تعديل التنبيه' : 'إضافة تنبيه'}
          </Text>
          <View className="w-8" />
        </View>

        {/* --- Tabs --- (مزادات comes later: with it off, only an auctions
            alert being edited still opens its own form) */}
        {FEATURES.auctions && (
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
        )}

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
            {FEATURES.auctions
              ? 'تابع العقارات والخدمات والمزادات التي تهمك ليصلك اشعار في حاله توافر الطلب.'
              : 'تابع العقارات والخدمات التي تهمك ليصلك اشعار في حاله توافر الطلب.'}
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
        {/* Clear of the home indicator / nav bar (bottom edge isn't safe) */}
        <View
          className="border-t border-gray-100 px-5 pt-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="h-12 w-full items-center justify-center rounded-full bg-[#15304D]"
          >
            <Text className="font-cairo-bold text-base text-white">
              {isEdit ? 'حفظ التعديلات' : 'إنشاء تنبيه'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <AlertSuccessModal
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
        onViewAlerts={() => {
          setShowSuccess(false);
          // Always land on the alerts list, whichever screen opened the form
          // (back would return to e.g. search results)
          if (router.canDismiss()) router.dismissAll();
          router.replace({
            pathname: '/(individual)/activity',
            params: { tab: 'alerts' },
          });
        }}
        onReturnHome={() => {
          setShowSuccess(false);
          router.replace(getIdentityHomeRoute(activeIdentity?.type));
        }}
      />
    </SafeAreaView>
  );
}
