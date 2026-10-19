import { Text, View } from 'react-native';

import type { RequestReply } from '@/features/company/components/requests/types';
import {
  CardDivider,
  RequestCard,
} from '@/features/individual/components/request-details/RequestCard';

function ReplyBlock({ label, text }: { label: string; text: string }) {
  return (
    <View className="gap-3 rounded-[6px] bg-[#F9FAFE] p-[14px]">
      <Text
        className="font-cairo-semibold text-[13px] leading-[20px] text-[#6B6A6A]"
        style={{ writingDirection: 'rtl', letterSpacing: 0.26 }}
      >
        {label}
      </Text>
      <Text
        className="font-cairo text-[14px] leading-[21px] text-[#111111]"
        style={{ writingDirection: 'rtl', letterSpacing: -0.408 }}
      >
        {text}
      </Text>
    </View>
  );
}

/** The company's answer: الرد, العرض لا يشمل and ملاحظات, on #F9FAFE blocks. */
export function ReplyBlocks({ reply }: { reply: RequestReply }) {
  return (
    <View className="gap-[2px] rounded-[6px] bg-[#F9FAFE]">
      {!!reply.message && <ReplyBlock label="الرد" text={reply.message} />}
      {!!reply.excludes && (
        <ReplyBlock label="العرض لا يشمل" text={reply.excludes} />
      )}
      {!!reply.notes && <ReplyBlock label="ملاحظات" text={reply.notes} />}
    </View>
  );
}

/** "تفاصيل رد الشركة" card. */
export default function ProviderReplyCard({ reply }: { reply: RequestReply }) {
  if (!reply.message && !reply.excludes && !reply.notes) return null;
  return (
    <RequestCard>
      <Text
        className="font-cairo-bold text-[15px] leading-[20px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        تفاصيل رد الشركة
      </Text>
      <CardDivider />
      <ReplyBlocks reply={reply} />
    </RequestCard>
  );
}
