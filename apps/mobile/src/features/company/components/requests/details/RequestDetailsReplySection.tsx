import { Text, View } from 'react-native';

import type { RequestReply } from '../types';

export interface RequestDetailsReplySectionProps {
  reply?: RequestReply | null;
}

function Part({ label, text, testID }: { label: string; text: string; testID: string }) {
  return (
    <View className="gap-1">
      <Text
        className="font-cairo-medium text-[12px] text-[#6B6A6A]"
        style={{ writingDirection: 'rtl' }}
      >
        {label}
      </Text>
      <Text
        testID={testID}
        className="font-cairo-semibold text-[13px] leading-[22px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        {text}
      </Text>
    </View>
  );
}

/**
 * تفاصيل الرد (Figma 8475:53031): what the company answered, العرض يشمل,
 * العرض لا يشمل and ملاحظات, each only when given.
 */
export default function RequestDetailsReplySection({
  reply,
}: RequestDetailsReplySectionProps) {
  if (!reply?.message && !reply?.excludes && !reply?.notes) return null;

  return (
    <View testID="request-details-reply-section" className="mt-4">
      <Text
        className="mb-2 font-cairo-bold text-[16px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        تفاصيل الرد
      </Text>
      <View className="gap-4 rounded-[12px] bg-[#F9FAFE] p-3.5">
        {!!reply.message && (
          <Part label="العرض يشمل:" text={reply.message} testID="request-details-reply-includes" />
        )}
        {!!reply.excludes && (
          <Part
            label="العرض لا يشمل:"
            text={reply.excludes}
            testID="request-details-reply-excludes"
          />
        )}
        {!!reply.notes && (
          <Part label="ملاحظات" text={reply.notes} testID="request-details-reply-notes" />
        )}
      </View>
    </View>
  );
}
