import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Control, Controller, UseFormSetValue } from "react-hook-form";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import FormInput from "@/components/FormInput";
import { CompanySignupFormValues } from "@/features/auth/companyAuthSchemas";

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

interface Step2Props extends StepProps {}

export const SignupStep2: React.FC<Step2Props> = ({ control }) => (
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
    />
    <FormInput
      control={control}
      name="serviceAreas"
      label="مناطق تقديم الخدمة"
      placeholder="اختر نطاقات الخدمة"
    />
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
      <View className="flex-row justify-end mb-1">
        <Text className="text-sm font-cairo-bold text-charcoal">لوجو الشركة</Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        className="w-full h-32 border-2 border-dashed border-gray-300 rounded-3xl items-center justify-center bg-gray-50"
      >
        <Feather name="image" size={28} color="#94A3B8" className="mb-2" />
        <Text className="text-charcoal font-cairo-bold mb-1">
          اضغط هنا لرفع اللوجو
        </Text>
        <Text className="text-xs text-slate-400 font-cairo-medium">الصيغ المدعومة: SVG, JPG, PNG</Text>
      </TouchableOpacity>
    </View>
  </View>
);

interface Step3Props extends StepProps {
  onOpenActivitySheet: () => void;
  onOpenDatePicker: () => void;
  showDatePicker: boolean;
  onDateChange: (event: any, date?: Date) => void;
}

export const SignupStep3: React.FC<Step3Props> = ({
  control,
  onOpenActivitySheet,
  onOpenDatePicker,
  showDatePicker,
  onDateChange,
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
        leftIcon={<Feather name="chevron-down" size={20} color="#6B6A6A" />}
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
        leftIcon={<Feather name="calendar" size={20} color="#6B6A6A" />}
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
      <View className="flex-row justify-end mb-1">
        <Text className="text-sm font-cairo-bold text-slate-800">صورة الرخصة</Text>
        <Text className="text-red-500 ml-1">*</Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl items-center justify-center bg-gray-50"
      >
        <Feather name="file-text" size={28} color="#94A3B8" className="mb-2" />
        <Text className="text-slate-800 font-cairo-bold mb-1">اضغط هنا لرفع ملف</Text>
        <Text className="text-xs text-slate-400 font-cairo-medium">
          الصيغ المدعومة: SVG, JPG, PNG (بحد أقصى 10 ميجا لكل ملف)
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);
