import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { Control, Controller } from 'react-hook-form';
import { Platform, Text, TouchableOpacity, View } from 'react-native';

import FormInput from '@/components/FormInput';
import { CompanySignupFormValues } from '@/features/auth/companyAuthSchemas';

interface StepProps {
  control: Control<CompanySignupFormValues>;
  type: 'company' | 'office';
}

export const SignupStep1: React.FC<StepProps> = ({ control, type }) => {
  const nameLabel = type === 'office' ? 'اسم المكتب' : 'اسم الشركة';
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
        label="البريد الإلكتروني"
        placeholder="alisalem@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <FormInput
        control={control}
        name="phone"
        label="رقم الهاتف"
        placeholder="55123456"
        keyboardType="phone-pad"
      />
      <FormInput
        control={control}
        name="password"
        label="كلمة المرور"
        placeholder="**************"
        isPassword={true}
      />
      <FormInput
        control={control}
        name="confirmPassword"
        label="تأكيد كلمة المرور"
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
        placeholder="اختر الخدمات التي تقدمها.."
        isRequired={false}
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

          let borderColorClass = 'border-gray-200';
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

                {/* Map Pin Icon (Leading/Left) */}
                <View style={{ marginStart: 12 }}>
                  <Feather name="map-pin" size={20} color={iconColor} />
                </View>

                {/* Validation Success Icon */}
                {isSuccess && (
                  <View className="p-1" style={{ marginStart: 12 }}>
                    <Feather name="check" size={20} color={iconColor} />
                  </View>
                )}
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
            label="مناطق تقديم الخدمة"
            placeholder="اختر نطاقات الخدمة"
            editable={false}
            pointerEvents="none"
            isRequired={false}
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
        isRequired={false}
      />

      <View className="mb-4 w-full">
        <View className="mb-1 flex-row justify-start">
          <Text className="font-cairo-semibold text-sm text-charcoal">
            {logoLabel}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={pickLogo}
          className={`h-40 w-full items-center justify-center rounded-3xl border-2 border-dashed ${logoFile ? 'border-[#22C55E] bg-green-50' : 'border-gray-200 bg-white'}`}
        >
          {logoFile ? (
            <>
              <Feather
                name="check-circle"
                size={28}
                color="#22C55E"
                className="mb-2"
              />
              <Text className="mb-1 font-bold text-[#111111]">
                {logoFile.name}
              </Text>
            </>
          ) : (
            <>
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-[#F0F5FA]">
                <Feather name="file-text" size={22} color="#15304D" />
              </View>
              <Text className="mb-1 font-cairo-medium text-sm text-charcoal">
                <Text className="font-cairo-bold text-[#15304D]">اضغط هنا</Text>{' '}
                لرفع ملفك
              </Text>
              <Text className="font-cairo-medium text-xs text-slate-400">
                الصيغ المدعومة: SVG, JPG, PNG (بحد أقصى 10 ميجا لكل ملف)
              </Text>
            </>
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
        label="نشاط الرخصة"
        placeholder="تشطيبات،بناء،ديكور،كهرباء"
        editable={false}
        pointerEvents="none"
        isRequired={false}
        rightIcon={<Feather name="chevron-down" size={20} color="#6B6A6A" />}
      />
    </TouchableOpacity>

    <FormInput
      control={control}
      name="licenseNumber"
      label="رقم الرخصة"
      placeholder="ادخل رقم الرخصة"
    />

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
        <Text className="font-cairo-semibold text-sm text-charcoal">
          صورة الرخصة
        </Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={pickLicense}
        className={`h-40 w-full items-center justify-center rounded-3xl border-2 border-dashed ${licenseFile ? 'border-[#22C55E] bg-green-50' : 'border-gray-200 bg-white'}`}
      >
        {licenseFile ? (
          <>
            <Feather
              name="check-circle"
              size={28}
              color="#22C55E"
              className="mb-2"
            />
            <Text className="mb-1 font-bold text-[#111111]">
              {licenseFile.name}
            </Text>
          </>
        ) : (
          <>
            <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-[#F0F5FA]">
              <Feather name="file-text" size={22} color="#15304D" />
            </View>
            <Text className="mb-1 font-cairo-medium text-sm text-charcoal">
              <Text className="font-cairo-bold text-[#15304D]">اضغط هنا</Text>{' '}
              لرفع صورة أو فيديو
            </Text>
            <Text className="font-cairo-medium text-xs text-slate-400">
              الصيغ المدعومة: SVG, JPG, PNG (بحد أقصى 10 ميجا لكل ملف)
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  </View>
);
