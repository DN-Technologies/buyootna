import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import {
  Platform,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Alert,
} from 'react-native';

import FormInput from '@/components/FormInput';
import { CompanySignupFormValues } from '@/features/auth/companyAuthSchemas';

interface StepProps {
  control: Control<CompanySignupFormValues>;
  type: 'company' | 'office';
}

export const SignupStep1: React.FC<StepProps> = ({ control, type }) => {
  const nameLabel = type === 'office' ? 'اسم المكتب*' : 'اسم الشركة*';
  const namePlaceholder =
    type === 'office' ? 'البيان للمقاولة' : 'البنيان للمقاولات';

  return (
    <View className="flex-1">
      <FormInput
        control={control}
        name="name"
        label={nameLabel}
        placeholder={namePlaceholder}
      />
      <FormInput
        control={control}
        name="email"
        label="البريد الإلكتروني*"
        placeholder="alisalem@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <FormInput
        control={control}
        name="phone"
        label="رقم الهاتف*"
        placeholder="01282388770"
        keyboardType="phone-pad"
      />
      <FormInput
        control={control}
        name="password"
        label="كلمة المرور*"
        placeholder="**************"
        isPassword={true}
      />
      <FormInput
        control={control}
        name="confirmPassword"
        label="تأكيد كلمة المرور*"
        placeholder="**************"
        isPassword={true}
      />
    </View>
  );
};

interface Step2Props extends StepProps {
  logoFile: DocumentPicker.DocumentPickerAsset | null;
  pickLogo: () => void;
  onOpenServiceAreasSheet?: () => void;
  onOpenLocationSheet?: () => void;
  hqAddressLabel?: string;
}

export const SignupStep2: React.FC<Step2Props> = ({
  control,
  type,
  logoFile,
  pickLogo,
  onOpenServiceAreasSheet,
  onOpenLocationSheet,
  hqAddressLabel,
}) => {
  const aboutLabel = type === 'office' ? 'نبذة عن المكتب' : 'نبذة عن الشركة';
  const logoLabel = type === 'office' ? 'لوجو المكتب' : 'لوجو الشركة';

  return (
    <View className="flex-1">
      <FormInput
        control={control}
        name="services"
        label="الخدمات"
        placeholder="تصميم داخلي، تنفيذ صيانة، إشراف"
      />
      <Controller
        control={control}
        name="hqLocation"
        render={({
          field: { onChange, value },
          fieldState: { error, isTouched },
        }) => {
          const hasError = !!error;
          const isSuccess =
            isTouched && !hasError && value !== undefined && value !== '';

          let borderColorClass = 'border-gray-300';
          let iconColor = '#6B6A6A';

          if (hasError) {
            borderColorClass = 'border-red-500';
            iconColor = '#EF4444';
          } else if (isSuccess) {
            borderColorClass = 'border-green-500';
            iconColor = '#22C55E';
          }

          const handleMapPress = () => {
            if (onOpenLocationSheet) {
              onOpenLocationSheet();
            }
          };

          return (
            <View className="mb-4 w-full">
              {/* Label */}
              <View className="mb-1 flex-row items-center justify-start">
                <Text className="font-cairo-semibold text-sm tracking-tight text-charcoal">
                  المقر الرئيسي
                </Text>
                <Text className="ml-[2px] font-bold text-red-500">*</Text>
              </View>

              {/* Clickable Field */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleMapPress}
                className={`h-14 flex-row items-center rounded-xl border-[1.5px] bg-white px-4 ${borderColorClass}`}
              >
                {/* Value Text */}
                <Text
                  className={`flex-1 font-cairo-medium text-base tracking-normal ${
                    hqAddressLabel ? 'text-charcoal' : 'text-gray-400'
                  }`}
                  style={{
                    writingDirection: 'rtl',
                    paddingTop: Platform.OS === 'ios' ? 4 : 0,
                  }}
                >
                  {hqAddressLabel ||
                    (type === 'office'
                      ? 'أين يقع مقر المكتب ؟'
                      : 'أين يقع مقر الشركة ؟')}
                </Text>

                {/* Validation Success Icon */}
                {isSuccess && (
                  <View className="p-1" style={{ marginStart: 12 }}>
                    <Feather name="check" size={20} color={iconColor} />
                  </View>
                )}

                {/* Map Pin Icon (Trailing) */}
                <View style={{ marginStart: 12 }}>
                  <Feather name="map-pin" size={20} color={iconColor} />
                </View>
              </TouchableOpacity>

              {/* Error Message */}
              {hasError && (
                <View className="mt-1.5 w-full flex-row justify-start">
                  <Text
                    className="font-cairo-medium text-xs text-red-500"
                    style={{ textAlign: 'right', writingDirection: 'rtl' }}
                  >
                    {error?.message}
                  </Text>
                </View>
              )}
            </View>
          );
        }}
      />

      {type === 'company' && onOpenServiceAreasSheet && (
        <TouchableOpacity activeOpacity={1} onPress={onOpenServiceAreasSheet}>
          <FormInput
            control={control}
            name="serviceAreas"
            label="مناطق تقديم الخدمة*"
            placeholder="اختر نطاقات الخدمة"
            editable={false}
            pointerEvents="none"
            rightIcon={
              <Feather name="chevron-down" size={20} color="#6B6A6A" />
            }
          />
        </TouchableOpacity>
      )}

      <FormInput
        control={control}
        name="about"
        label={aboutLabel}
        placeholder={
          type === 'office'
            ? 'نبذة تعريفية عن المكتب...'
            : 'نبذة تعريفية عن الشركة...'
        }
        multiline={true}
        numberOfLines={6}
        className="h-40 items-start"
      />

      <View className="mb-4 w-full">
        <View className="mb-1 flex-row justify-start">
          <Text className="font-cairo-bold text-sm text-charcoal">
            {logoLabel}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={pickLogo}
          className={`h-32 w-full items-center justify-center rounded-3xl border-2 border-dashed ${logoFile ? 'border-[#22C55E] bg-green-50' : 'border-gray-300 bg-gray-50'}`}
        >
          <Feather
            name={logoFile ? 'check-circle' : 'image'}
            size={28}
            color={logoFile ? '#22C55E' : '#94A3B8'}
            className="mb-2"
          />
          <Text className="mb-1 font-bold text-[#111111]">
            {logoFile ? logoFile.name : 'اضغط هنا لرفع اللوجو'}
          </Text>
          {!logoFile && (
            <Text className="font-cairo-medium text-xs text-slate-400">
              الصيغ المدعومة: SVG, JPG, PNG (بحد أقصى 10 ميجا)
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface Step3Props extends StepProps {
  onOpenActivitySheet: () => void;
  onOpenDatePicker: () => void;
  showDatePicker: boolean;
  onDateChange: (event: any, date?: Date) => void;
  licenseFile: DocumentPicker.DocumentPickerAsset | null;
  pickLicense: () => void;
}

export const SignupStep3: React.FC<Step3Props> = ({
  control,
  type,
  onOpenActivitySheet,
  onOpenDatePicker,
  showDatePicker,
  onDateChange,
  licenseFile,
  pickLicense,
}) => (
  <View className="flex-1">
    <TouchableOpacity activeOpacity={1} onPress={onOpenActivitySheet}>
      <FormInput
        control={control}
        name="licenseActivity"
        label="النشاط الرخصة"
        placeholder="تشطيبات، بناء، ديكور، كهرباء"
        editable={false}
        pointerEvents="none"
        isRequired={false}
        rightIcon={<Feather name="chevron-down" size={20} color="#6B6A6A" />}
      />
    </TouchableOpacity>

    <TouchableOpacity activeOpacity={1} onPress={onOpenDatePicker}>
      <FormInput
        control={control}
        name="licenseExpiry"
        label="تاريخ انتهاء الرخصة"
        placeholder="15 ابريل 2027"
        editable={false}
        pointerEvents="none"
        isRequired={false}
        rightIcon={<Feather name="calendar" size={20} color="#6B6A6A" />}
      />
    </TouchableOpacity>

    {showDatePicker && (
      <DateTimePicker
        value={new Date()}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={onDateChange}
        minimumDate={new Date()}
      />
    )}

    <View className="mb-4 w-full">
      <View className="mb-1 flex-row justify-start">
        <Text className="font-cairo-bold text-sm text-slate-800">
          صورة الرخصة
        </Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={pickLicense}
        className={`h-32 w-full items-center justify-center rounded-3xl border-2 border-dashed ${licenseFile ? 'border-[#22C55E] bg-green-50' : 'border-gray-300 bg-gray-50'}`}
      >
        <Feather
          name={licenseFile ? 'check-circle' : 'file-text'}
          size={28}
          color={licenseFile ? '#22C55E' : '#94A3B8'}
          className="mb-2"
        />
        <Text className="mb-1 font-bold text-[#111111]">
          {licenseFile ? licenseFile.name : 'اضغط هنا لرفع ملف'}
        </Text>
        {!licenseFile && (
          <Text className="px-4 text-center font-cairo-medium text-xs text-slate-400">
            اضغط هنا لرفع صورة أو فيديو{'\n'}الصيغ المدعومة: SVG, JPG, PNG (بحد
            أقصى 10 ميجا لكل ملف)
          </Text>
        )}
      </TouchableOpacity>
      <Text
        className="mt-2 font-cairo-medium text-[12px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        صورة الرخصة تؤهلك لتوثيق حسابك
      </Text>
    </View>
  </View>
);
