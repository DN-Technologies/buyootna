import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import * as DocumentPicker from 'expo-document-picker';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import {
  CompanySignupFormValues,
  createCompanySignupSchema,
  getStep1Fields,
  STEP_2_FIELDS,
} from '@/features/auth/companyAuthSchemas';
import MapPickerModal from '@/shared/components/MapPickerModal';
import SelectionBottomSheet from '@/shared/components/SelectionBottomSheet';
import SuccessBottomSheet from '@/shared/components/SuccessBottomSheet';
import { resetToIdentityHome } from '@/shared/navigation/getIdentityHomeRoute';

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
  // False when adding an identity to an already logged-in account — that
  // account already has an email/phone/password, so skip collecting them.
  includeAccountFields?: boolean;
}

export const CompanySignupForm: React.FC<CompanySignupFormProps> = ({
  type,
  onSubmit,
  logoFile,
  pickLogo,
  licenseFile,
  pickLicense,
  isLoading = false,
  includeAccountFields = true,
}) => {
  const [step, setStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hqAddressLabel, setHqAddressLabel] = useState<string>('');
  const [showMapPicker, setShowMapPicker] = useState(false);

  const activitySheetRef = useRef<BottomSheetModal>(null);
  const serviceAreasSheetRef = useRef<BottomSheetModal>(null);
  const successSheetRef = useRef<BottomSheetModal>(null);

  const { control, handleSubmit, trigger, setValue, watch } =
    useForm<CompanySignupFormValues>({
      resolver: zodResolver(createCompanySignupSchema(includeAccountFields)),
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
      isStepValid = await trigger(getStep1Fields(includeAccountFields));
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
      successSheetRef.current?.present();
    }
  };

  const closeSuccessModal = () => {
    successSheetRef.current?.dismiss();
    resetToIdentityHome(null);
  };

  const successMessage =
    type === 'office'
      ? 'يقوم فريقنا حالياً بمراجعة بيانات المكتب والمستندات وسيتم إشعارك فور تفعيل الحساب.'
      : 'يقوم فريقنا حالياً بمراجعة بيانات الشركة والمستندات وسيتم إشعارك فور تفعيل الحساب.';

  return (
    <View className="flex-1">
      {step === 1 && (
        <SignupStep1
          control={control}
          type={type}
          includeAccountFields={includeAccountFields}
        />
      )}
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
              className="h-[48px] items-center justify-center px-6 py-4"
            >
              <Text className="font-cairo-semibold text-[14px] leading-[24px] text-charcoal">
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
            className={`h-[48px] flex-1 items-center justify-center rounded-3xl ${step === 3 && isLoading ? 'bg-primary/70' : 'bg-primary'}`}
          >
            {step === 3 && isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="font-cairo-semibold text-[14px] leading-[24px] text-white">
                {step < 3
                  ? 'التالي'
                  : includeAccountFields
                    ? 'إنشاء حساب'
                    : 'إضافة الهوية'}
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

      <SuccessBottomSheet
        ref={successSheetRef}
        title="تم إرسال طلبك بنجاح"
        description={successMessage}
        buttonText="العودة الى الرئيسية"
        onPress={closeSuccessModal}
        iconType="document-search"
        footerText="مدة المراجعة المتوقعة: خلال 24 ساعة"
      />
    </View>
  );
};
