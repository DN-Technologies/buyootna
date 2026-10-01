import { Text, TouchableOpacity, View } from 'react-native';

import type { LoginMethod } from '@/shared/api/settings.service';

interface LoginMethodOptionProps {
  id: LoginMethod;
  title: string;
  subtitle?: string | null;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}

function Radio({ selected, disabled }: { selected: boolean; disabled: boolean }) {
  return (
    <View
      className={`h-[18px] w-[18px] items-center justify-center rounded-full border ${
        selected ? 'border-[#15304D]' : 'border-[#A6A6A6]'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      {selected && <View className="h-[10px] w-[10px] rounded-full bg-[#15304D]" />}
    </View>
  );
}

// One choice card: radio + title, with the email/phone under it
export default function LoginMethodOption({
  id,
  title,
  subtitle,
  selected,
  disabled,
  onPress,
}: LoginMethodOptionProps) {
  return (
    <TouchableOpacity
      testID={`login-method-${id}`}
      activeOpacity={0.7}
      onPress={onPress}
      // Greyed out but still tappable: tapping says why it can't be chosen
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityHint={disabled ? 'غير متاح حالياً' : undefined}
      className="rounded-[10px] border border-[#ECECEC] bg-white px-3 py-3"
    >
      <View className="flex-row items-center gap-2">
        <Radio selected={selected} disabled={disabled} />
        <Text
          className={`font-cairo-medium text-[14px] ${
            disabled ? 'text-[#A6A6A6]' : 'text-[#111111]'
          }`}
        >
          {title}
        </Text>
      </View>
      {!!subtitle && (
        <Text
          className="mt-1 text-right font-cairo text-[12px] text-[#6B6A6A]"
          style={{ writingDirection: 'ltr' }}
        >
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
}
