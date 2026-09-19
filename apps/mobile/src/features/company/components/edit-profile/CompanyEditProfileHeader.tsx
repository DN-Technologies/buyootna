import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface CompanyEditProfileHeaderProps {
  onBack: () => void;
  title?: string;
}

export default function CompanyEditProfileHeader({
  onBack,
  title = 'تعديل الملف الشخصي',
}: CompanyEditProfileHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      {/* Visual Right in RTL (Child 0): Back button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onBack}
        className="h-9 w-9 items-center justify-center rounded-full"
      >
        <Feather name="chevron-right" size={22} color="#111111" />
      </TouchableOpacity>

      {/* Center (Child 1): Screen Title */}
      <Text className="flex-1 text-center font-cairo-semibold text-[18px] text-[#111111]">
        {title}
      </Text>

      {/* Visual Left in RTL (Child 2): Spacer to center title */}
      <View className="h-9 w-9" />
    </View>
  );
}
