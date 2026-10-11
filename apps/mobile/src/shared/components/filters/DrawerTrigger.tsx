import { Text, TouchableOpacity, View } from 'react-native';

import { LockIcon } from '@/assets/icons/home/property';
import RequirementMark from '@/shared/components/ui/RequirementMark';

export interface DrawerTriggerProps {
  label: string;
  placeholder: string;
  value?: string;
  onPress: () => void;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  locked?: boolean;
}

export default function DrawerTrigger({
  label,
  placeholder,
  value,
  onPress,
  required,
  optional,
  disabled,
  locked,
}: DrawerTriggerProps) {
  return (
    <View className="mb-6 flex-1" style={{ flex: 1 }}>
      <Text
        className="mb-1 font-cairo-medium text-sm text-[#111111]"
        style={{
          writingDirection: 'rtl',
        }}
      >
        {label}
        <RequirementMark required={required} optional={optional} />
      </Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        disabled={disabled}
        className={`h-[40px] w-full justify-center rounded-md border border-[#ECECEC] px-4 ${disabled ? 'bg-gray-50' : 'bg-white'}`}
        style={{ width: '100%' }}
      >
        <View className="flex-row items-center justify-between gap-2 w-full">
          <Text
            className={`font-cairo text-[13px] leading-[22px] ${value ? 'text-[#111111]' : 'text-[#979797]'}`}
            style={{
              writingDirection: 'rtl',
            }}
          >
            {value || placeholder}
          </Text>
          {locked && <LockIcon size={14} color="#94A3B8" />}
        </View>
      </TouchableOpacity>
    </View>
  );
}

