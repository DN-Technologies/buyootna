import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import SelectionBottomSheet from '@/core/components/SelectionBottomSheet';
import MapPickerModal from '@/core/components/MapPickerModal';
import {
  CompanySignupFormValues,
  companySignupSchema,
  STEP_1_FIELDS,
  STEP_2_FIELDS,
} from '@/features/auth/companyAuthSchemas';

import { CompanySignupProgress } from './CompanySignupProgress';
import { SignupStep1, SignupStep2, SignupStep3 } from './CompanySignupSteps';

interface CompanySignupFormProps {
  type: 'company' | 'office';
  onSubmit: (data: CompanySignupFormValues) => Promise<boolean>;
  logoFile: DocumentPicker.DocumentPickerAsset | null;
  pickLogo: () => void;
  licenseFile: DocumentPicker.DocumentPickerAsset | null;
  pickLicense: () => void;
  isLoading?: boolean;
}

export const CompanySignupForm: React.FC<CompanySignupFormProps> = ({
  type,
  onSubmit,
  logoFile,
  pickLogo,
  licenseFile,
  pickLicense,
  isLoading = false,
}) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hqAddressLabel, setHqAddressLabel] = useState<string>('');
  const [showMapPicker, setShowMapPicker] = useState(false);

  const activitySheetRef = useRef<BottomSheetModal>(null);
  const serviceAreasSheetRef = useRef<BottomSheetModal>(null);

  const { control, handleSubmit, trigger, setValue, watch } =
    useForm<CompanySignupFormValues>({
      resolver: zodResolver(companySignupSchema),
      defaultValues: {
        type: type,
      },
      mode: 'onTouched',
    });

  const selectedActivity = watch('licenseActivity');
  const selectedServiceAreas = watch('serviceAreas');

  useEffect(() => {
    setValue('type', type);
  }, [type, setValue]);

  const handleNextStep = async () => {
    let isStepValid = false;
    if (step === 1) {
      isStepValid = await trigger(STEP_1_FIELDS);
    } else if (step === 2) {
      isStepValid = await trigger(STEP_2_FIELDS);
    }

    if (isStepValid) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate && event.type !== 'dismissed') {
      const formattedDate = selectedDate.toLocaleDateString('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      setValue('licenseExpiry', formattedDate, { shouldValidate: true });
    }
  };

  const handleFinalSubmit = async (data: CompanySignupFormValues) => {
    const success = await onSubmit(data);
    if (success) {
      setShowSuccessModal(true);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    router.replace('/(main)/home');
  };

  const successMessage =
    type === 'office'
      ? 'يقوم فريقنا حالياً بمراجعة بيانات المكتب والمستندات وسيتم إشعارك فور تفعيل الحساب.'
      : 'يقوم فريقنا حالياً بمراجعة بيانات الشركة والمستندات وسيتم إشعارك فور تفعيل الحساب.';

  return (
    <View className="flex-1">
      {step === 1 && <SignupStep1 control={control} type={type} />}
      {step === 2 && (
        <SignupStep2
          control={control}
          type={type}
          logoFile={logoFile}
          pickLogo={pickLogo}
          onOpenServiceAreasSheet={() =>
            serviceAreasSheetRef.current?.present()
          }
          onOpenLocationSheet={() => setShowMapPicker(true)}
          hqAddressLabel={hqAddressLabel}
        />
      )}
      {step === 3 && (
        <SignupStep3
          control={control}
          type={type}
          onOpenActivitySheet={() => activitySheetRef.current?.present()}
          onOpenDatePicker={() => setShowDatePicker(true)}
          showDatePicker={showDatePicker}
          onDateChange={handleDateChange}
          licenseFile={licenseFile}
          pickLicense={pickLicense}
        />
      )}

      {/* Footer Actions */}
      <View className="mt-auto pt-6">
        <CompanySignupProgress step={step} totalSteps={3} />

        <View className="w-full flex-row items-center justify-between">
          {step > 1 && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePrevStep}
              className="items-center justify-center px-6 py-4"
            >
              <Text className="font-cairo-semibold text-lg text-charcoal">
                السابق
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={
              step < 3 ? handleNextStep : handleSubmit(handleFinalSubmit)
            }
            disabled={step === 3 && isLoading}
            className={`flex-1 items-center justify-center rounded-3xl py-4 ${step === 3 && isLoading ? 'bg-primary/70' : 'bg-primary'}`}
          >
            {step === 3 && isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="font-cairo-bold text-lg text-white">
                {step < 3 ? 'التالي' : 'إنشاء حساب'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <SelectionBottomSheet
        ref={activitySheetRef}
        title="اختر النشاط"
        options={['تشطيبات', 'بناء', 'ديكور', 'كهرباء', 'سباكة', 'تكييف']}
        selectedValue={selectedActivity}
        onSelect={(val) =>
          setValue('licenseActivity', val, { shouldValidate: true })
        }
      />

      <SelectionBottomSheet
        ref={serviceAreasSheetRef}
        title="اختر نطاقات الخدمة"
        options={[
          'كل المناطق',
          'العاصمة',
          'حولي',
          'الفروانية',
          'الأحمدي',
          'الجهراء',
          'مبارك الكبير',
        ]}
        selectedValue={selectedServiceAreas}
        onSelect={(val) =>
          setValue('serviceAreas', val, { shouldValidate: true })
        }
      />

      {(() => {
        const hqLocationVal = watch('hqLocation');
        let initialLat: number | undefined;
        let initialLng: number | undefined;
        if (hqLocationVal && hqLocationVal.includes(',')) {
          const [latStr, lngStr] = hqLocationVal.split(',');
          initialLat = parseFloat(latStr);
          initialLng = parseFloat(lngStr);
        }
        return (
          <MapPickerModal
            visible={showMapPicker}
            onClose={() => setShowMapPicker(false)}
            onConfirm={(addressName, lat, lng) => {
              setValue('hqLocation', `${lat},${lng}`, { shouldValidate: true });
              setHqAddressLabel(addressName);
            }}
            initialLat={initialLat}
            initialLng={initialLng}
          />
        );
      })()}

      {/* Custom Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeSuccessModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <View className="w-full items-center rounded-3xl bg-white p-6">
            {/* Success Icon */}
            <View className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-[#22C55E]/10">
              <Feather name="file-text" size={32} color="#22C55E" />
              <View
                style={{ position: 'absolute', bottom: -2, right: -2 }}
                className="rounded-full border border-white bg-[#22C55E] p-0.5"
              >
                <Feather name="check" size={12} color="white" />
              </View>
            </View>

            {/* Success Title */}
            <Text className="mb-2 text-center font-cairo-bold text-xl text-charcoal">
              تم إرسال طلبك بنجاح
            </Text>

            {/* Success Description */}
            <Text className="mb-6 text-center font-cairo-medium text-sm leading-6 text-[#6B6A6A]">
              {successMessage}
            </Text>

            {/* Action Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={closeSuccessModal}
              className="mb-4 w-full items-center justify-center rounded-3xl bg-primary py-4"
            >
              <Text className="font-cairo-bold text-lg text-white">
                العودة الى الرئيسية
              </Text>
            </TouchableOpacity>

            {/* Expected Review Period */}
            <Text className="text-center font-cairo-medium text-xs text-[#9CA3AF]">
              مدة المراجعة المتوقعة خلال 24 ساعة
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};
