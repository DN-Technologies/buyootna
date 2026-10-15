import { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { ChatMessage } from '@/shared/api/chat.service';
import MessageMeta from '@/shared/components/chat/MessageMeta';
import {
  formatAppointment,
  formatOffer,
  PROPOSAL_STATUS_LABELS,
} from '@/shared/utils/chatProposals';
import { MessageStatus } from '@/shared/utils/chatReceipts';

export type ProposalAction = 'accept' | 'decline' | 'cancel';

interface ProposalCardProps {
  message: ChatMessage;
  timestamp: string;
  quote?: ReactNode;
  // قبول / رفض / إلغاء
  onRespond?: (action: ProposalAction) => void;
  // عرض مقابل / اقتراح موعد آخر
  onCounter?: () => void;
  // While an answer is being sent
  busy?: boolean;
  status?: MessageStatus | null;
}

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  PENDING: { bg: '#FEF3C7', fg: '#92400E' },
  ACCEPTED: { bg: '#DCFCE7', fg: '#166534' },
  DECLINED: { bg: '#FEE2E2', fg: '#991B1B' },
  COUNTERED: { bg: '#E0E7FF', fg: '#3730A3' },
  CANCELLED: { bg: '#F1F5F9', fg: '#475569' },
};

/**
 * A viewing appointment (📅) or price offer (💰). The receiver answers
 * قبول / رفض / counter while it's pending; the sender can cancel it.
 */
export default function ProposalCard({
  message,
  timestamp,
  quote,
  onRespond,
  onCounter,
  busy = false,
  status,
}: ProposalCardProps) {
  const p = message.proposal;
  if (!p) return null;
  const isMine = message.isMine;
  const isAppointment = p.kind === 'APPOINTMENT';
  const isPast =
    isAppointment && !!p.scheduledAt && new Date(p.scheduledAt) <= new Date();
  // Answerable once the server has it, while pending and not in the past
  const open = p.status === 'PENDING' && !message.sending && !isPast;
  const statusLabel =
    p.status === 'PENDING' && isPast ? 'انتهى الموعد' : PROPOSAL_STATUS_LABELS[p.status];
  const colors = STATUS_COLORS[p.status === 'PENDING' && isPast ? 'CANCELLED' : p.status];

  return (
    <View className={`mb-4 w-full flex-row ${isMine ? 'justify-start' : 'justify-end'}`}>
      <View className={`w-72 max-w-[85%] ${isMine ? 'items-start' : 'items-end'}`}>
        {quote}
        <View
          testID="proposal-card"
          className="w-full overflow-hidden rounded-md border border-[#ECECEC] bg-white"
        >
          <View className="flex-row items-center justify-between bg-[#F9FAFE] px-4 py-2.5">
            <Text className="font-cairo-bold text-[14px] text-[#15304D]">
              {isAppointment ? '📅 موعد معاينة' : '💰 عرض سعر'}
            </Text>
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: colors.bg }}>
              <Text
                testID="proposal-status"
                className="font-cairo-semibold text-[11px]"
                style={{ color: colors.fg }}
              >
                {statusLabel}
              </Text>
            </View>
          </View>

          <View className="px-4 py-3">
            <Text
              testID="proposal-detail"
              className="font-cairo-bold text-[17px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              {isAppointment ? formatAppointment(p.scheduledAt) : formatOffer(p.amount, p.period)}
            </Text>
            {!!p.note && (
              <Text
                className="mt-1 font-cairo text-[13px] text-[#4B5563]"
                style={{ writingDirection: 'rtl' }}
              >
                {p.note}
              </Text>
            )}
            {!isAppointment && (
              // Same right edge as the lines above it: without an explicit
              // direction this line was laid out from the left (QA)
              <Text
                testID="proposal-disclaimer"
                className="mt-1.5 font-cairo text-[10px] text-[#94A3B8]"
                style={{ writingDirection: 'rtl' }}
              >
                العرض للتوثيق داخل المحادثة وليس عقداً ملزماً
              </Text>
            )}
          </View>

          {open && !isMine && (
            <View className="flex-row border-t border-[#ECECEC]">
              <TouchableOpacity
                testID="proposal-accept"
                disabled={busy}
                onPress={() => onRespond?.('accept')}
                className="flex-1 items-center py-2.5"
              >
                <Text className="font-cairo-bold text-[13px] text-[#166534]">قبول</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="proposal-counter"
                disabled={busy}
                onPress={onCounter}
                className="flex-1 items-center border-x border-[#ECECEC] py-2.5"
              >
                <Text className="font-cairo-bold text-[13px] text-[#15304D]">
                  {isAppointment ? 'موعد آخر' : 'عرض مقابل'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="proposal-decline"
                disabled={busy}
                onPress={() => onRespond?.('decline')}
                className="flex-1 items-center py-2.5"
              >
                <Text className="font-cairo-bold text-[13px] text-[#991B1B]">رفض</Text>
              </TouchableOpacity>
            </View>
          )}
          {open && isMine && (
            <TouchableOpacity
              testID="proposal-cancel"
              disabled={busy}
              onPress={() => onRespond?.('cancel')}
              className="items-center border-t border-[#ECECEC] py-2.5"
            >
              <Text className="font-cairo-bold text-[13px] text-[#991B1B]">إلغاء</Text>
            </TouchableOpacity>
          )}
        </View>
        <MessageMeta timestamp={timestamp} status={status} />
      </View>
    </View>
  );
}
