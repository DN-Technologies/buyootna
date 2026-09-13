import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COMPANY_CATEGORY_OPTIONS } from '@/features/individual/components/companies/CategoryFilterSheet';
import { useIdentity } from '@/shared/hooks/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { settingsService } from '@/shared/api/settings.service';
import SuccessBottomSheet from '@/shared/components/SuccessBottomSheet';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';
import { showAlert } from '@/shared/utils/alert';

const DESCRIPTION_MAX_LENGTH = 100;

const SERVICE_TYPE_OPTIONS = COMPANY_CATEGORY_OPTIONS.filter(
  (option) => option.id !== 'all',
);

const inputClassName =
  'h-[46px] w-full rounded-md border border-[#ECECEC] bg-white px-3 text-right font-cairo text-[14px] text-[#111111]';

function FieldLabel({ text }: { text: string }) {
  return (
    <View className="flex-row items-center justify-end">
      <Text
        className="font-cairo-medium text-[14px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        {text}
      </Text>
      <Text className="font-cairo-medium text-[14px] text-[#D12121]"> *</Text>
    </View>
  );
}

export default function AddServiceScreen() {
  const router = useRouter();
  const { activeIdentity } = useIdentity();
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  const [serviceType, setServiceType] = useState('');
  const [serviceTitle, setServiceTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const successSheetRef = useRef<BottomSheetModal>(null);

  const filteredOptions = useMemo(() => {
    const query = serviceType.trim();
    if (!query) return SERVICE_TYPE_OPTIONS;
    return SERVICE_TYPE_OPTIONS.filter((option) =>
      option.label.includes(query),
    );
  }, [serviceType]);

  const isValid =
    serviceType.trim().length > 0 &&
    serviceTitle.trim().length > 0 &&
    description.trim().length > 0 &&
    description.length <= DESCRIPTION_MAX_LENGTH;

  const handleSelectOption = (label: string) => {
    setServiceType(label);
    setIsDropdownOpen(false);
  };

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await settingsService.updateProfile({
        services: serviceType.trim(),
      });
      refreshProfile();
      setIsSubmitting(false);
      successSheetRef.current?.present();
    } catch (error) {
      setIsSubmitting(false);
      showAlert(
        'فشل إضافة الخدمة',
        getApiErrorMessage(error, 'حدث خطأ، حاول مرة أخرى'),
        [{ text: 'حسناً' }],
      );
    }
  };

  const handleViewService = () => {
    successSheetRef.current?.dismiss();
    if (activeIdentity?.id) {
      router.push(`/company/${activeIdentity.id}` as never);
    } else {
      router.back();
    }
  };

  const handleAddAnother = () => {
    successSheetRef.current?.dismiss();
    setServiceType('');
    setServiceTitle('');
    setDescription('');
    setIsDropdownOpen(false);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* --- Header --- */}
        <View className="h-[52px] flex-row items-center px-4 py-[6px]">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-8 w-8 items-center justify-center"
          >
            <Ionicons name="chevron-forward" size={20} color="#111111" />
          </TouchableOpacity>
          <Text className="flex-1 text-center font-cairo-semibold text-[18px] leading-[23px] text-[#111111]">
            إضافة خدمة
          </Text>
          <View className="h-8 w-8" />
        </View>

        {/* --- Form --- */}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="flex-1"
        >
          <View className="gap-5 px-4 pb-6 pt-3">
            {/* 1. Service type (combo: pick or type) */}
            <View className="gap-1.5">
              <FieldLabel text="نوع الخدمة" />
              <View>
                <View
                  className={`h-[46px] w-full flex-row items-center rounded-md border border-[#ECECEC] bg-white px-3 ${
                    isDropdownOpen ? 'border-b-0 rounded-b-none' : ''
                  }`}
                >
                  <TextInput
                    value={serviceType}
                    onChangeText={setServiceType}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="اختر أو اكتب نوع الخدمة التي تريد اضافتها"
                    placeholderTextColor="#979797"
                    className="h-full flex-1 text-right font-cairo text-[14px] text-[#111111]"
                    style={{ writingDirection: 'rtl' }}
                  />
                  <TouchableOpacity
                    onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="ml-2 h-6 w-6 items-center justify-center"
                  >
                    <Ionicons
                      name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#111111"
                    />
                  </TouchableOpacity>
                </View>

                {/* Dropdown options panel */}
                {isDropdownOpen && (
                  <View
                    className="max-h-[355px] overflow-hidden rounded-b-md rounded-t-none border border-[#ECECEC] bg-white p-3"
                    style={{
                      shadowColor: '#939393',
                      shadowOpacity: 0.2,
                      shadowRadius: 12,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 4,
                    }}
                  >
                    <ScrollView
                      nestedScrollEnabled
                      showsVerticalScrollIndicator
                      keyboardShouldPersistTaps="handled"
                    >
                      {filteredOptions.map((option) => {
                        const isSelected = option.label === serviceType;
                        return (
                          <TouchableOpacity
                            key={option.id}
                            activeOpacity={0.7}
                            onPress={() => handleSelectOption(option.label)}
                            className="h-9 w-full flex-row items-center px-2"
                          >
                            <Text
                              className="flex-1 text-right font-cairo-medium text-[13px] text-[#111111]"
                              style={{ writingDirection: 'rtl' }}
                              numberOfLines={1}
                            >
                              {option.label}
                            </Text>
                            {isSelected && (
                              <Ionicons
                                name="checkbox"
                                size={16}
                                color="#15304D"
                              />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                      {filteredOptions.length === 0 && (
                        <Text
                          className="py-2 text-right font-cairo text-[13px] text-[#979797]"
                          style={{ writingDirection: 'rtl' }}
                        >
                          لا توجد نتائج مطابقة
                        </Text>
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            {/* 2. Service title */}
            <View className="gap-1.5">
              <FieldLabel text="عنوان الخدمة" />
              <TextInput
                value={serviceTitle}
                onChangeText={setServiceTitle}
                placeholder="اكتب نبذة عن الخدمة لاظهارها للعملاء..."
                placeholderTextColor="#979797"
                className={inputClassName}
                style={{ writingDirection: 'rtl' }}
              />
            </View>

            {/* 3. Description */}
            <View className="gap-1.5">
              <FieldLabel text="الوصف" />
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="اكتب نبذة عن الخدمة لاظهارها للعملاء..."
                placeholderTextColor="#979797"
                multiline
                textAlignVertical="top"
                maxLength={DESCRIPTION_MAX_LENGTH}
                className="h-[119px] w-full rounded-md border border-[#ECECEC] bg-white px-3 pt-4 text-right font-cairo text-[14px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              />
              <Text
                className="mt-0.5 text-right font-cairo-medium text-[10px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                يجب أن لا يتخطى الوصف 100 حرف.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* --- Fixed bottom CTA --- */}
        <View className="px-4 pb-6 pt-3">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={!isValid || isSubmitting}
            className={`h-12 w-full items-center justify-center rounded-full ${
              !isValid || isSubmitting ? 'bg-[#A6A6A6]' : 'bg-[#15304D]'
            }`}
          >
            <Text className="font-cairo-semibold text-[14px] text-white">
              إضافة الخدمة
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* --- Success bottom sheet --- */}
      <SuccessBottomSheet
        ref={successSheetRef}
        title="تمت إضافة الخدمة بنجاح!"
        description="الخدمة الآن نشطة ومتاحة في ملفك العقاري. يمكن للمستخدمين تصفحها وبدء التواصل معك مباشرة عبر واتساب، الاتصال، أو المحادثات."
        buttonText="عرض الخدمة"
        onPress={handleViewService}
        secondaryButtonText="إضافة خدمة أخرى"
        onSecondaryPress={handleAddAnother}
        secondaryButtonVariant="neutral"
      />
    </SafeAreaView>
  );
}
