import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { PartyPopperIcon } from '@/assets/icons/company-home';
import { formatArabicDate } from '@/shared/utils/helpers/property';

interface IconNoticeProps {
  testID: string;
  icon: ReactNode;
  title: string;
  lines: string[];
  // The trial-ended notice is outlined in red
  danger?: boolean;
}

function IconNotice({ testID, icon, title, lines, danger }: IconNoticeProps) {
  return (
    <View
      testID={testID}
      className={`w-full flex-row items-start rounded-lg p-3 ${
        danger ? 'border border-[#9C1E28] bg-white' : 'bg-[#F9FAFE]'
      }`}
      style={{ gap: 12 }}
    >
      {icon}
      <View className="flex-1 items-start py-1.5" style={{ gap: 6 }}>
        <Text
          className="font-cairo-semibold text-sm text-[#111111]"
          style={{ writingDirection: 'rtl', letterSpacing: 0.28 }}
        >
          {title}
        </Text>
        {lines.map((line) => (
          <Text
            key={line}
            className="font-cairo-medium text-xs leading-[17px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}

interface TrialNoticeProps {
  daysLeft: number;
  endsAt: string | null;
}

/** The free trial is running: days left and the date it ends. */
export function TrialNotice({ daysLeft, endsAt }: TrialNoticeProps) {
  const lines = [`يتبقى ${daysLeft} يومًا للاستمتاع بجميع المميزات.`];
  if (endsAt) lines.push(`تنتهي في: ${formatArabicDate(endsAt)}`);
  return (
    <IconNotice
      testID="balance-trial-notice"
      icon={<PartyPopperIcon />}
      title="أنت تستخدم النسخة التجريبية"
      lines={lines}
    />
  );
}

/** The trial ran out and the company never bought a plan. */
export function TrialEndedNotice({ canPurchase }: { canPurchase: boolean }) {
  return (
    <IconNotice
      testID="balance-trial-ended-notice"
      danger
      icon={
        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#FFEBEB]">
          <Image
            source={require('@/assets/icons/company-balance/warning.svg')}
            style={{ width: 18, height: 18 }}
            contentFit="contain"
          />
        </View>
      }
      title="انتهت الفترة التجريبية."
      // No purchase wording where the app can't sell (iOS)
      lines={
        canPurchase ? ['اشترك في إحدى الباقات لاستعادة جميع المميزات.'] : []
      }
    />
  );
}

interface StatusLineProps {
  testID: string;
  tone: 'success' | 'warning';
  children: string;
}

/** A one-line coloured notice above the plan card. */
export function StatusLine({ testID, tone, children }: StatusLineProps) {
  const success = tone === 'success';
  return (
    <View
      testID={testID}
      className={`w-full rounded-lg px-3 py-3.5 ${
        success ? 'bg-[#EDFFEF]' : 'bg-white'
      }`}
      style={{ borderWidth: 0.5, borderColor: success ? '#018B1B' : '#B97500' }}
    >
      <Text
        className="font-cairo-semibold text-[13px]"
        style={{
          writingDirection: 'rtl',
          letterSpacing: 0.26,
          color: success ? '#018B1B' : '#B97500',
        }}
      >
        {children}
      </Text>
    </View>
  );
}
