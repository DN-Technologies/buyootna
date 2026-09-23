import { Feather } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

import { showAlert } from '@/shared/utils/alert';

interface OfficeNavBarProps {
  onBack: () => void;
  onOpenReport: () => void;
  onShareProfile?: () => void;
}

export default function OfficeNavBar({
  onBack,
  onOpenReport,
  onShareProfile,
}: OfficeNavBarProps) {
  const handleShowOptions = () => {
    showAlert('خيارات', '', [
      {
        text: 'مشاركة الملف الشخصي',
        onPress: onShareProfile ?? (() => {}),
      },
      {
        text: 'إبلاغ عن المكتب',
        style: 'destructive',
        onPress: onOpenReport,
      },
      { text: 'إلغاء', style: 'cancel' },
    ]);
  };

  return (
    <View className="flex-row items-center justify-between border-b border-gray-100 px-5 py-3">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onBack}
        className="h-9 w-9 items-center justify-center rounded-full bg-[#F8FAFC]"
      >
        <Feather name="chevron-right" size={22} color="#111111" />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleShowOptions}
        className="h-9 w-9 items-center justify-center rounded-full bg-[#F8FAFC]"
      >
        <Feather name="more-vertical" size={20} color="#111111" />
      </TouchableOpacity>
    </View>
  );
}
