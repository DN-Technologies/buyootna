import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import * as DocumentPicker from 'expo-document-picker';
import React, { useRef,useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator,Text, TouchableOpacity, View } from 'react-native';

import SelectionBottomSheet from '@/core/components/SelectionBottomSheet';
import {
  CompanySignupFormValues,
  companySignupSchema,
  STEP_1_FIELDS,
  STEP_2_FIELDS,
} from '@/features/auth/companyAuthSchemas';

import { CompanySignupProgress } from './CompanySignupProgress';
import { SignupStep1, SignupStep2, SignupStep3 } from './CompanySignupSteps';

interface CompanySignupFormProps {
  onSubmit: (data: CompanySignupFormValues) => void;
  logoFile: DocumentPicker.DocumentPickerAsset | null;
  pickLogo: () => void;
  licenseFile: DocumentPicker.DocumentPickerAsset | null;
  pickLicense: () => void;
  isLoading?: boolean;
}

export const CompanySignupForm: React.FC<CompanySignupFormProps> = ({
  onSubmit,
  logoFile,
  pickLogo,
  licenseFile,
  pickLicense,
  isLoading = false,
}) => {
  const [step, setStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const activitySheetRef = useRef<BottomSheetModal>(null);
  const serviceAreasSheetRef = useRef<BottomSheetModal>(null);

  const { control, handleSubmit, trigger, setValue, watch } =
    useForm<CompanySignupFormValues>({
      resolver: zodResolver(companySignupSchema),
      mode: 'onTouched',
    });

  const selectedActivity = watch('licenseActivity');
  const selectedServiceAreas = watch('serviceAreas');

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

  return (
    <View className="flex-1">
      {step === 1 && <SignupStep1 control={control} />}
      {step === 2 && (
        <SignupStep2
          control={control}
          onOpenServiceAreasSheet={() =>
            serviceAreasSheetRef.current?.present()
          }
          logoFile={logoFile}
          pickLogo={pickLogo}
        />
      )}
      {step === 3 && (
        <SignupStep3
          control={control}
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
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={step < 3 ? handleNextStep : handleSubmit(onSubmit)}
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
    </View>
  );
};
