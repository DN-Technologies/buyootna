import { Feather } from '@expo/vector-icons';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { CloseIcon } from '@/assets/icons/home/property';

import { formatFileMeta, isPdf } from './format';
import { CheckSmallIcon, ClockInfoIcon, InfoWarningIcon } from './icons';

// The «طلب التوثيق» sheets' shared look (Figma 10305:136105 and siblings)
export const SHEET_HANDLE = {
  backgroundColor: '#FAF2DB',
  width: 45,
  height: 5,
};
export const SHEET_BACKGROUND = {
  backgroundColor: '#FFFFFF',
  borderRadius: 24,
};

export const renderSheetBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    opacity={0.5}
  />
);

/** Title on the right, ✕ on the left. */
export function SheetHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <View className="w-full flex-row items-center justify-between py-1.5">
      <Text
        className="flex-1 font-cairo-semibold text-[18px] leading-[23px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        {title}
      </Text>
      <TouchableOpacity
        testID="verification-sheet-close"
        accessibilityLabel="إغلاق"
        onPress={onClose}
        className="h-8 w-8 items-center justify-center rounded-full"
      >
        <CloseIcon size={20} color="#111111" />
      </TouchableOpacity>
    </View>
  );
}

const NOTICE = {
  info: {
    bg: '#E0EAF9',
    accent: '#1849A9',
    icon: <ClockInfoIcon width={20} height={20} />,
    size: 13,
    radius: 8,
  },
  warning: {
    bg: '#FFF9DA',
    accent: '#B97500',
    icon: <InfoWarningIcon width={24} height={24} />,
    size: 14,
    radius: 6,
  },
};

/** A tinted notice with an accent bar on the right. */
export function Notice({
  variant,
  children,
}: {
  variant: keyof typeof NOTICE;
  children: ReactNode;
}) {
  const style = NOTICE[variant];
  return (
    <View
      className="w-full items-start gap-1 px-3 pb-3 pt-2.5"
      style={{
        backgroundColor: style.bg,
        borderRadius: style.radius,
        // The right side: RTL start
        borderStartWidth: 2,
        borderStartColor: style.accent,
      }}
    >
      {style.icon}
      <Text
        className="w-full font-cairo-medium leading-[1.5]"
        style={{
          color: style.accent,
          fontSize: style.size,
          lineHeight: style.size * 1.5,
          writingDirection: 'rtl',
        }}
      >
        {children}
      </Text>
    </View>
  );
}

/** A reason the admin gave, in red with a red bar on the right. */
export function IssueBox({ children }: { children: ReactNode }) {
  return (
    <View
      className="w-full gap-2 rounded-[6px] bg-[#FEF3F2] px-3 pb-3 pt-2.5"
      style={{ borderStartWidth: 2, borderStartColor: '#9C1E28' }}
    >
      {children}
    </View>
  );
}

export function IssueText({ children }: { children: ReactNode }) {
  return (
    <Text
      className="w-full font-cairo-medium text-[13px] leading-[16px] text-[#9C1E28]"
      style={{ writingDirection: 'rtl' }}
    >
      {children}
    </Text>
  );
}

/** The licence file: thumbnail, name and "date • size • type". */
export function LicenseFileRow({
  url,
  name,
  size,
  mimeType,
  date,
  received = false,
}: {
  url: string;
  name?: string | null;
  size?: number | null;
  mimeType?: string | null;
  date: string;
  // A ✓ on the left: the file was received
  received?: boolean;
}) {
  const pdf = isPdf(mimeType, name ?? url);
  return (
    <View className="w-full flex-row items-center gap-2">
      <View className="flex-1 flex-row items-center gap-2">
        {pdf ? (
          <View className="h-12 w-12 items-center justify-center rounded-[4px] bg-[#F5F7F9]">
            <Feather name="file-text" size={22} color="#15304D" />
          </View>
        ) : (
          <Image
            source={{ uri: url }}
            style={{ width: 48, height: 48, borderRadius: 4 }}
            contentFit="cover"
          />
        )}
        <View className="flex-1 items-start gap-1">
          <Text
            numberOfLines={1}
            className="font-cairo-medium text-[14px] leading-[17px] text-[#111111]"
          >
            {name || 'license'}
          </Text>
          <Text
            numberOfLines={1}
            className="font-cairo-regular text-[10px] leading-[12px] text-[#111111]"
          >
            {formatFileMeta(date, size, mimeType, name ?? url)}
          </Text>
        </View>
      </View>
      {received ? <CheckSmallIcon width={16} height={16} /> : null}
    </View>
  );
}
