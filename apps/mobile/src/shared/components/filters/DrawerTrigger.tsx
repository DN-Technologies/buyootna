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
  // 'lg' is the add-ad form's field: 46px tall, spaced by its parent
  size?: 'md' | 'lg';
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
  size = 'md',
}: DrawerTriggerProps) {
  const isLarge = size === 'lg';
  return (
    <View className={isLarge ? 'flex-1' : 'mb-6 flex-1'} style={{ flex: 1 }}>
      <Text
        className={`font-cairo-medium text-sm text-[#111111] ${isLarge ? 'mb-3' : 'mb-1'}`}
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
        className={`w-full justify-center rounded-md border border-[#ECECEC] ${isLarge ? 'h-[46px] px-3' : 'h-[40px] px-4'} ${disabled ? 'bg-gray-50' : 'bg-white'}`}
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

