import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import {
  CompanySignupFormValues,
  createCompanySignupSchema,
  getStep1Fields,
  STEP_2_FIELDS,
} from '@/features/auth/companyAuthSchemas';
import { TermsAgreement } from '@/features/auth/components/TermsAgreement';
import SelectionBottomSheet from '@/shared/components/feedback/SelectionBottomSheet';
import SuccessBottomSheet from '@/shared/components/feedback/SuccessBottomSheet';
import MapPickerModal from '@/shared/components/map/MapPickerModal';
import { SPECIALTIES } from '@/shared/data/serviceCatalog';
import { resetToIdentityHome } from '@/shared/navigation/getIdentityHomeRoute';
import { isCoordinates } from '@/shared/utils/location';
import type { PickedImage } from '@/shared/utils/pickImage';

import { CompanySignupProgress } from './CompanySignupProgress';
import { SignupStep1, SignupStep2, SignupStep3 } from './CompanySignupSteps';

interface CompanySignupFormProps {
  type: 'company' | 'office';
  onSubmit: (data: CompanySignupFormValues) => Promise<boolean>;
  logoFile: PickedImage | null;
  pickLogo: () => void;
  // An office's licence image; a company sends its licence later
  licenseFile?: DocumentPicker.DocumentPickerAsset | null;
  pickLicense?: () => void;
  isLoading?: boolean;
  // False when adding an identity to an already logged-in account — that
  // account already has an email/phone/password, so skip collecting them.
  includeAccountFields?: boolean;
  // «العودة الى الرئيسية» on the success sheet; defaults to the guest /
  // individual home (a new sign-up)
  onSuccessDone?: () => void;
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
  onSuccessDone,
}) => {
  const [step, setStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hqAddressLabel, setHqAddressLabel] = useState<string>('');
  const [showMapPicker, setShowMapPicker] = useState(false);

  const activitySheetRef = useRef<BottomSheetModal>(null);
  const specialtySheetRef = useRef<BottomSheetModal>(null);
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
  const selectedSpecialty = watch('specialty');
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
      const formattedDate = selectedDate.toLocaleDateString('ar-KW-u-nu-latn', {
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

  // Leaves the finished sign-up once, however the sheet was closed: it was
  // dismissible by a tap outside, which skipped this and left the user on a
  // screen with no way forward (QA)
  const leftRef = useRef(false);
  const leaveSignup = () => {
    if (leftRef.current) return;
    leftRef.current = true;
    if (onSuccessDone) onSuccessDone();
    else resetToIdentityHome(null);
  };
  const closeSuccessModal = () => {
    successSheetRef.current?.dismiss();
    leaveSignup();
  };

  const successMessage =
    type === 'office'
      ? 'يقوم فريقنا حالياً بمراجعة بيانات المكتب والمستندات وسيتم إشعارك فور تفعيل الحساب.'
      : // A company is live at once; only an office waits for review
        'تم تفعيل حساب شركتك، ويمكنك الآن إضافة خدماتك والظهور للعملاء.';

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
          onOpenSpecialtySheet={() => specialtySheetRef.current?.present()}
          control={control}
          type={type}
          onOpenActivitySheet={() => activitySheetRef.current?.present()}
          onOpenDatePicker={() => setShowDatePicker(true)}
          showDatePicker={showDatePicker}
          onDateChange={handleDateChange}
          licenseFile={licenseFile ?? null}
          pickLicense={pickLicense ?? (() => {})}
        />
      )}

      {/* Footer Actions */}
      <View className="mt-auto pt-6">
        {step === 3 && <TermsAgreement />}
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

      {/* «التخصص»: the services catalogue's مجال التخصص */}
      <SelectionBottomSheet
        ref={specialtySheetRef}
        title="اختر التخصص"
        options={SPECIALTIES}
        selectedValue={selectedSpecialty}
        onSelect={(val) => setValue('specialty', val, { shouldValidate: true })}
      />

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
        if (hqLocationVal && isCoordinates(hqLocationVal)) {
          const [latStr, lngStr] = hqLocationVal.split(',');
          initialLat = parseFloat(latStr);
          initialLng = parseFloat(lngStr);
        }
        return (
          <MapPickerModal
            visible={showMapPicker}
            onClose={() => setShowMapPicker(false)}
            onConfirm={(addressName, lat, lng) => {
              // The address name, not the pin: it is what the profile shows
              // and what location search matches
              setValue('hqLocation', addressName || `${lat},${lng}`, {
                shouldValidate: true,
              });
              setHqAddressLabel(addressName);
            }}
            initialLat={initialLat}
            initialLng={initialLng}
          />
        );
      })()}

      <SuccessBottomSheet
        ref={successSheetRef}
        title={type === 'office' ? 'تم إرسال طلبك بنجاح' : 'تم إنشاء حساب شركتك بنجاح'}
        description={successMessage}
        buttonText="العودة الى الرئيسية"
        onPress={closeSuccessModal}
        // Only «العودة الى الرئيسية» closes it, and any close still leaves
        dismissible={false}
        onDismiss={leaveSignup}
        iconType={type === 'office' ? 'document-search' : 'check'}
        footerText={type === 'office' ? 'مدة المراجعة المتوقعة: خلال 24 ساعة' : undefined}
      />
    </View>
  );
};
