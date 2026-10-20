import { Feather } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

import { showAlert } from '@/shared/utils/alert';

interface CompanyNavBarProps {
  onBack: () => void;
  onOpenReport: () => void;
  // Blocking the account behind the profile; absent hides the option
  onToggleBlock?: () => void;
  blocked?: boolean;
  onShareProfile?: () => void;
}

export default function CompanyNavBar({
  onBack,
  onOpenReport,
  onToggleBlock,
  blocked = false,
  onShareProfile,
}: CompanyNavBarProps) {
  const handleShowOptions = () => {
    showAlert('خيارات', '', [
      {
        text: 'مشاركة الملف الشخصي',
        onPress: onShareProfile ?? (() => {}),
      },
      {
        text: 'إبلاغ عن الشركة',
        style: 'destructive',
        onPress: onOpenReport,
      },
      ...(onToggleBlock
        ? [
            {
              text: blocked ? 'إلغاء حظر الشركة' : 'حظر الشركة',
              style: blocked ? ('default' as const) : ('destructive' as const),
              onPress: onToggleBlock,
            },
          ]
        : []),
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
        testID="profile-options"
        accessibilityLabel="خيارات"
        onPress={handleShowOptions}
        className="h-9 w-9 items-center justify-center rounded-full bg-[#F8FAFC]"
      >
        <Feather name="more-vertical" size={20} color="#111111" />
      </TouchableOpacity>
    </View>
  );
}
