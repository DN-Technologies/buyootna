import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Control, Controller, UseFormSetValue } from "react-hook-form";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import FormInput from "@/components/FormInput";
import { CompanySignupFormValues } from "@/features/auth/companyAuthSchemas";
import * as DocumentPicker from "expo-document-picker";

interface StepProps {
  control: Control<CompanySignupFormValues>;
}

export const SignupStep1: React.FC<StepProps> = ({ control }) => (
  <View className="flex-1">
    <FormInput
      control={control}
      name="name"
      label="اسم الشركة"
      placeholder="البنيان للمقاولات"
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
      placeholder="61234567"
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

interface Step2Props extends StepProps {
  onOpenServiceAreasSheet: () => void;
  logoFile: DocumentPicker.DocumentPickerAsset | null;
  pickLogo: () => void;
}

export const SignupStep2: React.FC<Step2Props> = ({
  control,
  onOpenServiceAreasSheet,
  logoFile,
  pickLogo,
}) => (
  <View className="flex-1">
    <FormInput
      control={control}
      name="services"
      label="الخدمات"
      placeholder="تصميم داخلي، تنفيذ صيانة، إشراف"
    />
    <FormInput
      control={control}
      name="hqLocation"
      label="المقر الرئيسي"
      placeholder="أين يقع مقر الشركة ؟"
      rightIcon={<Feather name="map-pin" size={20} color="#6B6A6A" />}
    />
    <TouchableOpacity activeOpacity={1} onPress={onOpenServiceAreasSheet}>
      <FormInput
        control={control}
        name="serviceAreas"
        label="مناطق تقديم الخدمة"
        placeholder="اختر نطاقات الخدمة"
        editable={false}
        pointerEvents="none"
        rightIcon={<Feather name="chevron-down" size={20} color="#6B6A6A" />}
      />
    </TouchableOpacity>
    <FormInput
      control={control}
      name="about"
      label="نبذة عن الشركة"
      placeholder="نبذة تعريفية عن الشركة..."
      multiline={true}
      numberOfLines={6}
      className="h-40 items-start"
    />

    <View className="mb-4 w-full">
      <View className="flex-row justify-start mb-1">
        <Text className="text-sm font-cairo-bold text-charcoal">
          لوجو الشركة
        </Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={pickLogo}
        className={`w-full h-32 border-2 border-dashed rounded-3xl items-center justify-center ${logoFile ? "border-[#22C55E] bg-green-50" : "border-gray-300 bg-gray-50"}`}
      >
        <Feather
          name={logoFile ? "check-circle" : "image"}
          size={28}
          color={logoFile ? "#22C55E" : "#94A3B8"}
          className="mb-2"
        />
        <Text className="text-[#111111] font-bold mb-1">
          {logoFile ? logoFile.name : "اضغط هنا لرفع اللوجو"}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

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
        display={Platform.OS === "ios" ? "spinner" : "default"}
        onChange={onDateChange}
        minimumDate={new Date()}
      />
    )}

    <View className="mb-4 w-full">
      <View className="flex-row justify-start mb-1">
        <Text className="text-sm font-cairo-bold text-slate-800">
          صورة الرخصة
        </Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={pickLicense}
        className={`w-full h-32 border-2 border-dashed rounded-3xl items-center justify-center ${licenseFile ? "border-[#22C55E] bg-green-50" : "border-gray-300 bg-gray-50"}`}
      >
        <Feather
          name={licenseFile ? "check-circle" : "file-text"}
          size={28}
          color={licenseFile ? "#22C55E" : "#94A3B8"}
          className="mb-2"
        />
        <Text className="text-[#111111] font-bold mb-1">
          {licenseFile ? licenseFile.name : "اضغط هنا لرفع ملف"}
        </Text>
        {!licenseFile && (
          <Text className="text-xs text-slate-400 font-cairo-medium">
            الصيغ المدعومة: SVG, JPG, PNG (بحد أقصى 10 ميجا لكل ملف)
          </Text>
        )}
      </TouchableOpacity>
    </View>
  </View>
);
