import { Text, View } from 'react-native';

import type { RequestStatus } from '@/features/company/components/requests/types';

// Figma "states" tag: 20px, Almarai 13, one square corner
const BADGES: Record<
  RequestStatus,
  { label: string; bg: string; fg: string; squareCorner: 'bl' | 'br' }
> = {
  pending: { label: 'قيد الانتظار', bg: '#FFF9DA', fg: '#B97500', squareCorner: 'bl' },
  responded: { label: 'تم الرد', bg: '#EFF8FF', fg: '#1849A9', squareCorner: 'bl' },
  accepted: { label: 'مقبول', bg: '#E1EFEC', fg: '#15A72B', squareCorner: 'bl' },
  rejected: { label: 'مرفوضة', bg: '#FFEBEB', fg: '#9C1E28', squareCorner: 'br' },
};

export default function RequestStatusBadge({
  status,
  label,
}: {
  status: RequestStatus;
  // Overrides the text (e.g. the section tag that stays "تم الرد")
  label?: string;
}) {
  const badge = BADGES[status] ?? BADGES.pending;
  return (
    <View
      testID="request-status-badge"
      className="h-5 items-center justify-center px-[10px]"
      style={{
        backgroundColor: badge.bg,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: badge.squareCorner === 'bl' ? 0 : 8,
        borderBottomRightRadius: badge.squareCorner === 'br' ? 0 : 8,
      }}
    >
      <Text
        className="font-almarai-regular text-[13px] leading-[16px]"
        style={{ color: badge.fg, letterSpacing: -0.408 }}
      >
        {label ?? badge.label}
      </Text>
    </View>
  );
}
