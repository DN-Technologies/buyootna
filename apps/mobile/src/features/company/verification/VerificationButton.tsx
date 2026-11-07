import type { ReactNode } from 'react';
import { Text, TouchableOpacity } from 'react-native';

import { ClockBlueIcon, EditWarningIcon, VerifyGreenIcon } from './icons';
import type { VerificationState } from './useCompanyVerification';

// The card's second button by state (Figma 10305:135030, 10305:137528,
// 10306:138043, 10307:141180)
const LOOK: Record<
  VerificationState,
  { label: string; bg: string; color: string; size: number; icon?: ReactNode }
> = {
  none: { label: 'طلب توثيق', bg: '#D9E2EE', color: '#15304D', size: 14 },
  pending: {
    label: 'طلبك قيد المراجعة',
    bg: '#E0EAF9',
    color: '#1849A9',
    size: 13,
    icon: <ClockBlueIcon width={14} height={14} />,
  },
  'changes-requested': {
    label: 'استكمال البيانات',
    bg: '#FFF9DA',
    color: '#B97500',
    size: 14,
    icon: <EditWarningIcon width={14} height={14} />,
  },
  verified: {
    label: 'حساب موثق',
    bg: '#E5FFE8',
    color: '#018B1B',
    size: 14,
    icon: <VerifyGreenIcon width={13.263} height={14} />,
  },
};

export default function VerificationButton({
  state,
  onPress,
}: {
  state: VerificationState;
  onPress: () => void;
}) {
  const look = LOOK[state];
  return (
    <TouchableOpacity
      testID={`verification-button-${state}`}
      activeOpacity={0.7}
      onPress={onPress}
      className="h-9 flex-1 flex-row items-center justify-center gap-1 rounded-[24px] px-2"
      style={{ backgroundColor: look.bg }}
    >
      {/* The icon sits right of the label: first in RTL */}
      {look.icon}
      <Text
        numberOfLines={1}
        className="font-cairo-bold"
        style={{ color: look.color, fontSize: look.size, letterSpacing: 0.28 }}
      >
        {look.label}
      </Text>
    </TouchableOpacity>
  );
}
