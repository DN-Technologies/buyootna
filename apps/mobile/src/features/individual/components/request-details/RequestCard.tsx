import { ReactNode } from 'react';
import { Text, View } from 'react-native';

export const CARD_BORDER = '#ECECEC';

/** Figma card: #FEFEFE, 1px #ECECEC, radius 6, padding 14. */
export function RequestCard({
  children,
  gap = 12,
}: {
  children: ReactNode;
  gap?: number;
}) {
  return (
    <View
      className="w-full rounded-[6px] border border-[#ECECEC] bg-[#FEFEFE] p-[14px]"
      style={{ gap }}
    >
      {children}
    </View>
  );
}

export const CardDivider = () => <View className="h-px w-full bg-[#ECECEC]" />;

/** A titled card: title, divider, then the body. */
export function RequestSectionCard({
  title,
  muted,
  children,
}: {
  title: string;
  // The offers-list frame greys the section titles (#A0A0A0 instead of #6B6A6A)
  muted?: boolean;
  children: ReactNode;
}) {
  return (
    <RequestCard>
      <Text
        className="font-cairo-semibold text-[13px] leading-[16px]"
        style={{ color: muted ? '#A0A0A0' : '#6B6A6A', writingDirection: 'rtl' }}
      >
        {title}
      </Text>
      <CardDivider />
      {children}
    </RequestCard>
  );
}
