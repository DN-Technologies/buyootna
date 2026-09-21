import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ChangePasswordHeaderProps {
  onBack: () => void;
  title?: string;
}

export const ChangePasswordHeader: React.FC<ChangePasswordHeaderProps> = ({
  onBack,
  title = 'تغيير كلمة المرور',
}) => {
  return (
    <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-4">
      <TouchableOpacity onPress={onBack} className="w-8">
        <Feather name="chevron-right" size={24} color="#111111" />
      </TouchableOpacity>
      <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
        {title}
      </Text>
      <View className="w-8" />
    </View>
  );
};

export default ChangePasswordHeader;
