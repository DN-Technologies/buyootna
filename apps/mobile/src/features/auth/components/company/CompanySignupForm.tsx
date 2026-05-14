import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import {
  CompanySignupFormValues,
  companySignupSchema,
  STEP_1_FIELDS,
  STEP_2_FIELDS,
} from "@/features/auth/companyAuthSchemas";
import { CompanySignupProgress } from "./CompanySignupProgress";
import { SignupStep1, SignupStep2, SignupStep3 } from "./CompanySignupSteps";
import SelectionBottomSheet from "@/core/components/SelectionBottomSheet";

interface CompanySignupFormProps {
  onSubmit: (data: CompanySignupFormValues) => void;
}

export const CompanySignupForm: React.FC<CompanySignupFormProps> = ({
  onSubmit,
}) => {
  const [step, setStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const activitySheetRef = useRef<BottomSheetModal>(null);

  const {
    control,
    handleSubmit,
    trigger,
    setValue,
    watch,
  } = useForm<CompanySignupFormValues>({
    resolver: zodResolver(companySignupSchema),
    mode: "onTouched",
  });

  const selectedActivity = watch("licenseActivity");

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
    if (selectedDate && event.type !== "dismissed") {
      const formattedDate = selectedDate.toLocaleDateString("ar-EG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setValue("licenseExpiry", formattedDate, { shouldValidate: true });
    }
  };

  return (
    <View className="flex-1">
      {step === 1 && <SignupStep1 control={control} />}
      {step === 2 && <SignupStep2 control={control} />}
      {step === 3 && (
        <SignupStep3
          control={control}
          onOpenActivitySheet={() => activitySheetRef.current?.present()}
          onOpenDatePicker={() => setShowDatePicker(true)}
          showDatePicker={showDatePicker}
          onDateChange={handleDateChange}
        />
      )}

      {/* Footer Actions */}
      <View className="mt-auto pt-6">
        <CompanySignupProgress step={step} totalSteps={3} />

        <View className="flex-row justify-between items-center w-full">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={step < 3 ? handleNextStep : handleSubmit(onSubmit)}
            className="flex-1 py-4 rounded-3xl items-center justify-center bg-primary"
          >
            <Text className="text-lg font-cairo-bold text-white">
              {step < 3 ? "التالي" : "إنشاء حساب"}
            </Text>
          </TouchableOpacity>

          {step > 1 && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePrevStep}
              className="py-4 px-6 items-center justify-center"
            >
              <Text className="text-lg font-cairo-semibold text-charcoal">
                السابق
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <SelectionBottomSheet
        ref={activitySheetRef}
        title="اختر النشاط"
        options={["تشطيبات", "بناء", "ديكور", "كهرباء", "سباكة", "تكييف"]}
        selectedValue={selectedActivity}
        onSelect={(val) =>
          setValue("licenseActivity", val, { shouldValidate: true })
        }
      />
    </View>
  );
};
