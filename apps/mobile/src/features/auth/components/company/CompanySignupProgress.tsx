import React from 'react';
import { Text,View } from 'react-native';

interface CompanySignupProgressProps {
  step: number;
  totalSteps: number;
}

export const CompanySignupProgress: React.FC<CompanySignupProgressProps> = ({
  step,
  totalSteps,
}) => {
  return (
    <View className="mb-6">
      <View className="mb-2 flex-row justify-end">
        <Text className="font-cairo-semibold text-xs text-gray-medium">
          {`خطوة ${step}/${totalSteps}`}
        </Text>
      </View>
      <View
        className="h-1.5 w-full flex-row overflow-hidden rounded-full bg-gray-200"
        style={{ direction: 'rtl' }}
      >
        <View
          className={`h-full bg-[#22C55E] ${step >= 1 ? 'w-1/3' : 'w-0'}`}
        />
        <View
          className={`h-full bg-[#22C55E] ${step >= 2 ? 'w-1/3' : 'w-0'}`}
        />
        <View
          className={`h-full bg-[#22C55E] ${step >= 3 ? 'w-1/3' : 'w-0'}`}
        />
      </View>
    </View>
  );
};
